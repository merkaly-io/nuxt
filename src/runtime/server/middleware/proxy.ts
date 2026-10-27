import { defineEventHandler, getRequestURL, proxyRequest } from 'h3';
import type { IncomingHttpHeaders } from 'node:http';
import { useRuntimeConfig } from '#imports';

const GLOBAL_API_HEADER = 'x-merkaly-global';
const TENANT_HOST_HEADER = 'x-merkaly-host';
const API_PREFIX_PATTERN = /^\/api\/?/;
const API_ROUTE_PATTERN = /^\/api(?:\/|$)/;
const EDGE_SLASH_PATTERN = /^\/|\/$/g;
const EDGE_HEADER_PATTERN = /^(cf-|cdn-loop$|true-client-ip$)/;

function normalizeSegment(value: string) {
  return value.replace(EDGE_SLASH_PATTERN, '');
}

function resolveProxyPath(prefix: string, pathname: string, search: string) {
  const normalizedPathname = pathname.replace(API_PREFIX_PATTERN, '');

  return `/${[prefix, normalizedPathname]
    .map(normalizeSegment)
    .filter(Boolean)
    .join('/')}${search}`;
}

function stripEdgeHeaders(headers: IncomingHttpHeaders) {
  Object.keys(headers)
    .filter((name) => EDGE_HEADER_PATTERN.test(name))
    .forEach((name) => Reflect.deleteProperty(headers, name));
}

function isGlobalRequest(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.includes('true');
  }

  return value === 'true';
}

export default defineEventHandler((event) => {
  if (!API_ROUTE_PATTERN.test(event.path)) {
    return;
  }

  const { public: $config } = useRuntimeConfig();

  const targetOrigin = new URL($config.merkaly.api.url);
  const url = getRequestURL(event);
  const prefix = isGlobalRequest(event.node.req.headers[GLOBAL_API_HEADER])
    ? ''
    : $config.merkaly.api.prefix;

  const path = resolveProxyPath(prefix, url.pathname, url.search);
  // x-forwarded-host is overwritten by edge proxies (e.g. Railway), so the
  // tenant host travels in a custom header the edge leaves untouched
  event.node.req.headers['x-forwarded-host'] = url.host;
  event.node.req.headers[TENANT_HOST_HEADER] = url.host;

  // Cloudflare rejects requests to a proxied origin that already carry its
  // own headers (cf-connecting-ip -> Error 1000), so drop the inbound edge
  // headers before forwarding to the API
  stripEdgeHeaders(event.node.req.headers);

  if (import.meta.dev && targetOrigin.hostname.endsWith('.test')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return proxyRequest(event, new URL(path, targetOrigin).toString());
});
