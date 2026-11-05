# @merkaly/nuxt

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A Nuxt module that provides Auth0 authentication integration and API utilities for Merkaly applications.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)

## Features

- 🔐 &nbsp;**Auth0 Integration** - Built-in Auth0 authentication with client-side support
- 🌐 &nbsp;**API Plugin** - Global API client with lifecycle hooks (onBeforeSend, onSuccess, onError, etc.)
- 🎯 &nbsp;**Auto-imports** - Composables automatically available throughout your app
- 🔧 &nbsp;**TypeScript Support** - Full TypeScript definitions included
- 📦 &nbsp;**Bootstrap Vue Next** - Integrated Bootstrap Vue Next components
- 🎨 &nbsp;**VueUse Integration** - Includes @vueuse/core, @vueuse/components, and more

## Quick Setup

Install the module to your Nuxt application:

## Authentication and tenant boot

Every surface can sign in; `auth0.requiresAuth` only decides whether pages require a login (globally, or per page with `definePageMeta({ requiresAuth: true })`). `auth0.requiresTenant` decides whether API calls require a tenant (`global: true` adapters bypass it).

On boot the module restores an existing session (user and token) and then runs the app hooks in order, `merkaly:tenant` then `merkaly:auth`, with that user (or none). `MKApp` shows its `loading` slot until both finish; if a hook throws, it shows the `error` slot instead. The auth callback page renders right away so it can complete the login.

| Surface | Login | Tenant | Boot |
|---|---|---|---|
| admin | required | required | `merkaly:tenant` creates the session and sets the tenant; without a session the auth middleware redirects to login. |
| dashboard | required | not used | `merkaly:auth` loads the session; without a session it redirects to login. |
| store | optional | required | `merkaly:tenant` resolves the store from the host (public); a signed-in buyer is restored too; protected pages (account, checkout) ask for login. |
| www | optional | not used | No hooks; anonymous or signed-in. |

### Session lifetime

The SPA keeps the session with **refresh tokens**: the client uses `useRefreshTokens` with `localStorage` cache and logs in with `audience` and `scope: openid profile email offline_access`. Before each API call the module asks Auth0 for the current access token, which is cached and renewed with the refresh token once it expires (2 hours for `https://api.merkaly.io`). When the refresh token is gone or expired, protected surfaces (`requiresAuth: true`) go back to login instead of calling the API without a token. Account linking (`linkWithConnection(connection)`) uses a separate Auth0 client, the account linking client (named `account.merkaly.io` in Auth0, no app behind it), with an in-memory cache, created only on the first call (no extra `checkSession` on page load). It opens a login popup for that connection and sends the popup's raw ID token to `POST /identities` as `{ idToken }`; the api verifies the token (signature, issuer, audience = the account linking client, expiry) and links the identity from its `sub` into the logged-in user. Requires an api with that contract (older clients that sent `{ provider, userId }` get `400`).

The Auth0 side (tenant, API, app settings, refresh token rotation and lifetimes, organizations, and the checklist for a new app) is documented in the auth.merkaly.io repo: [`docs/tenant-setup.md`](https://github.com/merkaly-io/auth.merkaly.io/blob/master/docs/tenant-setup.md).

## SEO: robots and sitemap

Every app gets `@nuxtjs/robots`. Apps are **private by default**: in production
`robots.txt` answers `Disallow: /` and pages carry the noindex meta and the
`X-Robots-Tag` header (admin, dashboard). Outside production nothing is indexable.

Public apps (www, store) opt in, and can also get `@nuxtjs/sitemap`, with
`hreflang` built from `merkaly.i18n` when the strategy has a locale prefix:

```ts
export default defineNuxtConfig({
  merkaly: {
    seo: {
      indexable: true,
      url: 'https://www.merkaly.io',
      disallow: ['/en/auth', '/es/auth', '/pt/auth'], // robots.txt
      sitemap: { exclude: ['/en/auth', '/es/auth', '/pt/auth'] }, // or `true`
    },
  },
});
```

The sitemap is only installed for indexable apps and is served at `/sitemap.xml`
(linked from `robots.txt`), a single file for every locale. The `x-default`
alternate points to `merkaly.i18n.defaultLocale`; the sitemap is installed after
`@nuxtjs/i18n` so it reads those options.

## PostHog

Product analytics with [PostHog](https://posthog.com), **US region**, behind a
first-party proxy. Set the project key and the module does the rest:

```ts
export default defineNuxtConfig({
  merkaly: {
    posthog: process.env.POSTHOG_KEY, // phc_...
  },
});
```

Without a key nothing is installed: no plugin, no proxy route and no
`posthog-js` in the bundle. With a key it lands in
`runtimeConfig.public.merkaly.posthog`, so `NUXT_PUBLIC_MERKALY_POSTHOG`
overrides it at runtime.

**Client plugin.** Initializes `posthog-js` **only in production builds**
(`nuxt dev` never sends events) with `api_host: '/phog'` and
`ui_host: 'https://us.posthog.com'`. It identifies the Auth0 user from
`useAuth()` (`identify(sub, { email, name })`) and calls `posthog.reset()` on
logout. The app can keep using `import posthog from 'posthog-js'` for
`capture()`: the module dedupes `posthog-js` so the app and the plugin share
the initialized instance (keep `posthog-js` as an app dependency).

**Proxy `/phog/**`.** A Nitro server route, so apps must run as a Node server
(`node .output/server`), not as static files.

| Path | Upstream |
|---|---|
| `/phog/static/*`, `/phog/array/*` | `https://us-assets.i.posthog.com` |
| everything else (`/e/`, `/batch/`, `/s/`, `/i/v1/*`, `/flags/`, `/decide/`...) | `https://us.i.posthog.com` |

- Path and query string are kept; `Host` is the upstream host (PostHog answers 401 otherwise).
- Forwarded: `PostHog-*` headers, `Content-Type`, `Content-Encoding`, `User-Agent`, `Accept`, and `Authorization` only when it is a PostHog token (`Bearer phc_`, `phs_` or `phx_`).
- `X-Forwarded-For` gets the client IP appended, so PostHog geolocates the visitor and not the server.
- **Cookies are never forwarded**, and PostHog `Set-Cookie` headers never reach the app domain.
- The request body is streamed, up to **64 MB** (session recordings); larger bodies get `413`.
- The response is streamed back with its status and cache headers.

The path is `/phog` because ad blockers drop requests to paths such as
`/posthog`, `/analytics`, `/tracking` or `/telemetry`; a first-party, neutral
path keeps events flowing.

## Money formatting

Money in Merkaly is stored as **integer cents**. `MKFormatMoney`, `MKInputMoney`,
`formatMoney()` and `useMoneyFormat()` divide by 100 and format with
`Intl.NumberFormat(locale, { style: 'currency', currency })`, so `24969` with
`BRL` + `pt-BR` renders `R$ 249,69`.

Currency and locale are resolved in this order:

1. Component props: `<MKFormatMoney :value="24969" currency="BRL" locale="pt-BR" />`
2. App-level default set at runtime with `setMoneyDefaults()` (stored with `useState`)
3. Module option `merkaly.money` (runtime config)
4. Fallback `USD` / `en-US`

### Module option

```ts
export default defineNuxtConfig({
  merkaly: {
    money: {
      currency: 'BRL', // ISO 4217
      locale: 'pt-BR', // BCP 47
    },
  },
});
```

It lives in `runtimeConfig.public.merkaly.money`, so it can also be set with
`NUXT_PUBLIC_MERKALY_MONEY_CURRENCY` / `NUXT_PUBLIC_MERKALY_MONEY_LOCALE`.

### Runtime default (per organization)

```ts
const { setMoneyDefaults } = useMoneyFormat();

// after loading the organization
setMoneyDefaults({
  currency: organization.localization.currency, // e.g. 'BRL'
  locale: organization.localization.language, // e.g. 'pt' or 'pt-BR'
});
```

`useMoneyFormat()` returns:

| Key | Description |
| --- | --- |
| `currency`, `locale` | Resolved defaults (computed) |
| `setMoneyDefaults({ currency?, locale? })` | Sets the app-level default (merged) |
| `resetMoneyDefaults()` | Clears the app-level default |
| `format(cents, options?)` | Formatted string using the resolved defaults |
| `formatParts(cents, options?)` | `{ prefix, amount, digits, suffix }` parts |

`setMoneyDefaults(defaults)` is also auto-imported as a standalone shortcut.

### Components

- `MKFormatMoney`: props `value` (cents), `currency`, `locale`, `base` (default `100`),
  `mode`, `hideDecimal`, `tag`. `currency` also accepts a plain symbol (`$`) for
  backward compatibility: the number keeps the resolved currency layout and the
  symbol replaces the currency sign.
- `MKInputMoney`: `v-model` in cents; props `currency`, `locale`. `prefix`, `decimal`,
  `thousands` and `placeholder` default to the resolved currency/locale and can still
  be passed explicitly.
