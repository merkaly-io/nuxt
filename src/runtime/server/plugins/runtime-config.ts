import { useRuntimeConfig } from '#imports';

interface RuntimeConfigCheck {
  env: string;
  expected: string;
  isValid: (value: unknown) => boolean;
  path: string[];
}

const MISSING_VALUES = ['', 'undefined', 'null']; // String(process.env.X) of a variable missing at build time
const HTTP_PROTOCOLS = ['http:', 'https:'];
const POSTHOG_KEY_PREFIX = 'phc_';

function isPresent(value: unknown): value is string {
  return typeof value === 'string' && !MISSING_VALUES.includes(value.trim());
}

function isAbsoluteHttpUrl(value: unknown) {
  return isPresent(value) && URL.canParse(value) && HTTP_PROTOCOLS.includes(new URL(value).protocol);
}

function isPathOrAbsoluteUrl(value: unknown) {
  return isPresent(value) && (value.startsWith('/') || isAbsoluteHttpUrl(value));
}

function isMissing(value: unknown) {
  return value === undefined || value === null || (typeof value === 'string' && MISSING_VALUES.includes(value.trim()));
}

function isOptionalString(value: unknown) {
  return isMissing(value) || isPresent(value); // only an app that needs it requires it
}

function isOptionalPosthogKey(value: unknown) {
  return isMissing(value) || (isPresent(value) && value.startsWith(POSTHOG_KEY_PREFIX)); // empty disables PostHog
}

// Only what every app needs is required; an app checks the values only it requires
const RUNTIME_CONFIG_CHECKS: RuntimeConfigCheck[] = [
  { path: ['api', 'url'], env: 'NUXT_PUBLIC_MERKALY_API_URL', expected: 'an absolute http(s) URL', isValid: isAbsoluteHttpUrl },
  { path: ['auth0', 'audience'], env: 'NUXT_PUBLIC_MERKALY_AUTH0_AUDIENCE', expected: 'empty or a string', isValid: isOptionalString },
  { path: ['auth0', 'client'], env: 'NUXT_PUBLIC_MERKALY_AUTH0_CLIENT', expected: 'empty or a string', isValid: isOptionalString },
  { path: ['auth0', 'domain'], env: 'NUXT_PUBLIC_MERKALY_AUTH0_DOMAIN', expected: 'empty or a string', isValid: isOptionalString },
  { path: ['auth0', 'callbackUrl'], env: 'NUXT_PUBLIC_MERKALY_AUTH0_CALLBACK_URL', expected: 'a path or an absolute URL', isValid: isPathOrAbsoluteUrl },
  { path: ['auth0', 'logoutUrl'], env: 'NUXT_PUBLIC_MERKALY_AUTH0_LOGOUT_URL', expected: 'a path or an absolute URL', isValid: isPathOrAbsoluteUrl },
  { path: ['posthog'], env: 'NUXT_PUBLIC_MERKALY_POSTHOG', expected: `empty or a "${POSTHOG_KEY_PREFIX}" key`, isValid: isOptionalPosthogKey },
];

function getConfigValue(config: Record<string, unknown>, path: string[]) {
  return path.reduce<unknown>((value, key) => (value as Record<string, unknown> | undefined)?.[key], config);
}

function describeRuntimeConfigIssue(check: RuntimeConfigCheck, value: unknown) {
  return `public.merkaly.${check.path.join('.')} is ${JSON.stringify(value) ?? 'undefined'}, expected ${check.expected} (${check.env})`;
}

function getRuntimeConfigIssues(merkaly: Record<string, unknown>) {
  return RUNTIME_CONFIG_CHECKS
    .map(check => ({ check, value: getConfigValue(merkaly, check.path) }))
    .filter(({ check, value }) => !check.isValid(value))
    .map(({ check, value }) => describeRuntimeConfigIssue(check, value));
}

export default function validateRuntimeConfig() { // Nitro plugin, defineNitroPlugin is an identity helper
  const issues = getRuntimeConfigIssues(useRuntimeConfig().public.merkaly ?? {});

  if (issues.length) {
    throw new Error(`[@merkaly/nuxt] Invalid runtime config, the server will not start:\n  - ${issues.join('\n  - ')}`); // loud at boot instead of a broken proxy later
  }
}
