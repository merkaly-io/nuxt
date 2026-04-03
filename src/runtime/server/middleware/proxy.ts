import { defineEventHandler, getRequestURL, proxyRequest } from 'h3';
import { useRuntimeConfig } from '#imports';

const GLOBAL_API_HEADER = 'x-merkaly-global';
const API_PREFIX_PATTERN = /^\/api\/?/;
const API_ROUTE_PATTERN = /^\/api(?:\/|$)/;
const EDGE_SLASH_PATTERN = /^\/|\/$/g;

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
  event.node.req.headers['x-forwarded-host'] = url.host;

  if (import.meta.dev && targetOrigin.hostname.endsWith('.test')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return proxyRequest(event, new URL(path, targetOrigin).toString());
});
