import { defineEventHandler, getRequestURL, proxyRequest } from 'h3';
import { useRuntimeConfig } from '#imports';

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

export default defineEventHandler((event) => {
  if (!API_ROUTE_PATTERN.test(event.path)) {
    return;
  }

  const { public: $config } = useRuntimeConfig();
  const targetOrigin = new URL($config.merkaly.api.url);
  const url = getRequestURL(event);
  const path = resolveProxyPath($config.merkaly.api.prefix, url.pathname, url.search);

  if (import.meta.dev && targetOrigin.hostname.endsWith('.test')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return proxyRequest(event, new URL(path, targetOrigin).toString());
});
