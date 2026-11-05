import type { H3Event } from 'h3';
import { createError, defineEventHandler, getRequestHeader, getRequestWebStream, send, sendStream, setResponseHeaders, setResponseStatus } from 'h3';

const PROXY_PREFIX = '/phog';
const INGEST_ORIGIN = 'https://eu.i.posthog.com';
const ASSETS_ORIGIN = 'https://eu-assets.i.posthog.com';
const ASSETS_PATH_PATTERN = /^\/(static|array)\//;
const POSTHOG_TOKEN_PATTERN = /^Bearer ph[csx]_/;
const MAX_BODY_BYTES = 64 * 1024 * 1024; // session recordings
const REQUEST_HEADERS = ['accept', 'content-encoding', 'content-type', 'user-agent'];
const RESPONSE_HEADERS = ['cache-control', 'content-type', 'etag', 'expires', 'last-modified', 'location', 'retry-after', 'vary'];

function resolveTarget(event: H3Event) {
  const path = event.path.slice(PROXY_PREFIX.length) || '/'; // keeps the query string
  const origin = ASSETS_PATH_PATTERN.test(path) ? ASSETS_ORIGIN : INGEST_ORIGIN;

  return new URL(path, origin);
}

function buildHeaders(event: H3Event, target: URL) {
  const incoming = event.node.req.headers;
  const headers = new Headers({ host: target.host }); // PostHog answers 401 to a foreign host

  Object.keys(incoming)
    .filter(name => name.startsWith('posthog-') || REQUEST_HEADERS.includes(name))
    .forEach(name => headers.set(name, String(incoming[name])));

  const authorization = getRequestHeader(event, 'authorization');

  if (authorization && POSTHOG_TOKEN_PATTERN.test(authorization)) headers.set('authorization', authorization); // project tokens only

  const chain = getRequestHeader(event, 'x-forwarded-for');
  const client = event.node.req.socket.remoteAddress;

  headers.set('x-forwarded-for', [chain, client].filter(Boolean).join(', '));

  return headers; // cookies never leave the app domain
}

function limitBody(event: H3Event, state: { tooLarge: boolean }) {
  const stream = getRequestWebStream(event);

  if (!stream) return undefined;

  let size = 0;

  return stream.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;

      if (size <= MAX_BODY_BYTES) return controller.enqueue(chunk);

      state.tooLarge = true;
      controller.error(new Error('PostHog body too large'));
    },
  }));
}

export default defineEventHandler((event) => {
  if (Number(getRequestHeader(event, 'content-length')) > MAX_BODY_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' });
  }

  const target = resolveTarget(event);
  const state = { tooLarge: false };
  const body = limitBody(event, state);

  return fetch(target, {
    body,
    duplex: body ? 'half' : undefined, // streamed request body
    headers: buildHeaders(event, target),
    method: event.method,
    redirect: 'manual',
  } as RequestInit)
    .catch((reason: Error) => {
      if (state.tooLarge) throw createError({ statusCode: 413, statusMessage: 'Payload Too Large' });

      throw createError({ cause: reason, statusCode: 502, statusMessage: 'PostHog unreachable' });
    })
    .then((response) => {
      setResponseStatus(event, response.status, response.statusText);

      setResponseHeaders(event, Object.fromEntries(RESPONSE_HEADERS
        .filter(name => response.headers.has(name))
        .map(name => [name, response.headers.get(name)!]))); // no set-cookie, no content-encoding (fetch already decoded it)

      return response.body ? sendStream(event, response.body) : send(event, '');
    });
});
