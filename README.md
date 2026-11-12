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

On boot the module restores an existing session (user and token) and then runs the bootstrap stages in a fixed order, each one only after the previous one finished:

1. **session**: the app hooks `merkaly:tenant` then `merkaly:auth`, with that user (or none).
2. **organization**: the app's organization loader (see `defineBootstrap`), always, signed in or not.
3. **me**: the app's `/auth/me` loader, only when the visitor is signed in.

The app mounts (and `MKApp` renders its default slot) only after the last stage, so pages, layouts and their requests start with the session, the organization and the user already loaded. A failing stage records the failure with `useAuth().fail()` (stage `tenant`, `organization` or `me`; never a logout) and `MKApp` renders the `error` slot; `retry()` runs again only the stages that did not succeed. The auth callback page renders right away so it can complete the login, and runs the stages after it.

| Surface | Login | Tenant | Boot |
|---|---|---|---|
| admin | required | required | `merkaly:tenant` creates the session and sets the tenant; then organization (`/settings/organization`) and me (`/auth/me`). Without a session the auth middleware redirects to login. |
| dashboard | required | not used | `merkaly:auth` loads the session; then me if it declares a loader. Without a session it redirects to login. |
| store | optional | required | `merkaly:tenant` resolves the store from the host (public); then organization (`/company`, public, also during SSR); me only for a signed-in buyer. Protected pages (account, checkout) ask for login. |
| www | optional | not used | No hooks and no loaders; anonymous or signed-in. |

### Ordered bootstrap (`defineBootstrap`, `useOrganization`, `useAuth().me`)

Each app declares its loaders once, from a plugin, with its own adapters (the module has no app endpoints):

```ts
// admin: app/plugins/bootstrap.ts
import { readAccountProfile } from '~/adapters/account/read.account.profile';
import { readSettingsOrganization } from '~/adapters/settings/organization/read.settings.organization';

export default defineNuxtPlugin(() => {
  defineBootstrap({
    me: () => readAccountProfile(() => ({ immediate: false })),
    organization: () => readSettingsOrganization(() => ({ immediate: false })),
  });
});
```

```ts
// store: app/plugins/bootstrap.ts (universal, not .client: SSR loads the organization too)
import { readAppCompany } from '~/adapters/app/read.company';

export default defineNuxtPlugin(() => {
  defineBootstrap({ organization: () => readAppCompany(() => ({ immediate: false })) });
});
```

A loader returns an adapter (`withAdapter()` result, preferably with `immediate: false`, the bootstrap runs it), a promise or a plain value. An adapter with an api error, or a rejected promise, fails the stage. Every stage is optional: an app without loaders skips it.

Two composables hold the state, shared by the whole app:

- `useOrganization()`: everything about the organization (tenant). It exists without a login and also loads on the server.
- `useAuth()`: everything about the user (`user`, `token`, `isAuthenticated`, `fail`, `retry`, `logout`, `signup`) plus `me`, the loaded profile.

| `useOrganization()` | Description |
|---|---|
| `id` | Organization id (Auth0 org), sent as the `identity` header; `''` until set |
| `setId(id, { server? })` | Sets the id; `server: true` when resolved during SSR |
| `hasId` | `Boolean(id)` |
| `fromServer` | The id was resolved during SSR: the page renders before auth |
| `data`, `status`, `error`, `isReady`, `refresh()` | The loaded organization, see below |

| `useAuth().me` and the stage keys of `useOrganization()` | Description |
|---|---|
| `data` | Loaded value; `undefined` until it loads (and always for `me` with visitors) |
| `status` | `idle`, `pending`, `success` or `error` |
| `error` | `{ message, status? }` of the last failure |
| `isReady` | `status === 'success'` |
| `refresh()` | Loads it again (e.g. after saving the settings); a failure here only sets `error`, it does not block the app |

```ts
const { data: organization, id } = useOrganization();
const { me } = useAuth();

const name = computed(() => me.data.value?.name); // typed by MerkalyMe
```

#### Typing (`MerkalyOrganization`, `MerkalyMe`)

`data` is typed with two interfaces exported by the package, empty by default. Each app extends them once with its own contracts (module augmentation, no generics at call sites), e.g. in `app/types/merkaly.d.ts`:

```ts
import type { AccountAuthProfile } from '@merkaly/api/account/auth';
import type { SettingsOrganizationProfileResponse } from '@merkaly/api/settings/organization';

declare module '@merkaly/nuxt' {
  interface MerkalyMe extends AccountAuthProfile {}
  interface MerkalyOrganization extends SettingsOrganizationProfileResponse {}
}
```

The file must be a module (keep at least one `import` or an `export {}`), otherwise it replaces the package types instead of extending them. The loaders passed to `defineBootstrap` are checked against the same interfaces.

In SSR apps (store) the organization stage also runs on the server, after the server plugins (`tenant.server.ts`), so it reaches the HTML; the client reuses it from the payload and does not request it again. `me` never runs on the server (there is no session there), so avoid rendering `me` data in SSR markup to keep hydration stable.

#### Migration per app (breaking: `useTenant` and its keys are gone)

`useTenant()` is removed; its keys live in `useOrganization()`: `tenant` → `id`, `setTenant(id, options)` → `setId(id, options)`, `fromServer` → `fromServer`, `isReady` (id set) → `hasId` (`isReady` now means the organization data loaded). The `merkaly:tenant` hook is unchanged: it still runs first and is where the id gets set.

- **admin**
  - `app/plugins/auth.ts:4`: `const { setTenant } = useTenant()` → `const { setId } = useOrganization()`; line 25: `setTenant(data.orgId)` → `setId(data.orgId)`.
  - `app/plugins/money.ts:8-18`: drop `useTenant()`, the `readSettingsOrganization()` call and the `watch(tenant, ...)`; use `watch(useOrganization().data, (data) => data && setMoneyDefaults({ currency: data.localization?.currency, locale: data.localization?.language }), { immediate: true })`.
  - New `app/plugins/bootstrap.ts` (above) and `app/types/merkaly.d.ts` (above).
  - `app/composables/useAccountProfile.ts:7`: `readAccountProfile()` → `const { data: profile, refresh } = useAuth().me`.
  - `app/pages/settings/(overview)/.composables/useSettingsOrganization.ts:5` (optional): read `useOrganization()` (`data`, `status === 'pending'`, `refresh`) instead of a second `readSettingsOrganization()`.
- **store**
  - `app/plugins/tenant.server.ts:4`: `const { setTenant } = useTenant()` → `const { setId } = useOrganization()`; lines 7 and 15: `setTenant(..., { server: true })` → `setId(..., { server: true })`.
  - `app/plugins/auth.ts:4`: `const { fromServer, setTenant } = useTenant()` → `const { fromServer, setId } = useOrganization()`; lines 9 and 13: `setTenant(...)` → `setId(...)`.
  - `app/pages/checkout/.composables/usePaymentStream.ts:11`: `const { tenant } = useTenant()` → `const { id: tenant } = useOrganization()` (line 43 keeps `tenant.value`).
  - New universal `app/plugins/bootstrap.ts` (above) and `app/types/merkaly.d.ts` with `MerkalyOrganization extends SettingsOrganizationStoreProfile`.
  - `app/layouts/default.vue:5` and `app/pages/account/orders/[order]/index.vue:85`: `readAppCompany()` → `const { data: company } = useOrganization()`.
  - `app/plugins/README.md:11` mentions `fromServer`: now from `useOrganization()`.
- **dashboard**: no `useTenant` or `useMe` usages, nothing required. Add `defineBootstrap({ me })` and `MerkalyMe` if it needs `/auth/me` before the pages.
- **www**: no usages, nothing required.

### Login entry points (`MKAuth`)

The callback page renders `MKAuth`, which reads its query string:

| Query | Behavior |
|---|---|
| `?code=...` (Auth0 callback) | Completes the login, navigates to the `appState.target` set when it started (or `/`) and emits `success` with that `appState`. |
| `?error=...&error_description=...` | Emits `error` and shows a 400 error page. |
| `?invitation=<ticket>&organization=<org_id>` | Accepts an organization invitation (Auth0 Organizations). |
| `?organization=<org_id>[&redirect=/path]` | Logs in straight into that organization (a silent login when the Auth0 session exists) and lands on `redirect`, e.g. `https://admin.merkaly.io/auth?organization=org_123&redirect=/onboarding` right after creating a store in www. |
| `?redirect=/path` | Plain login, lands on `redirect` (the auth middleware sends protected pages here). |

To open the Auth0 signup screen instead of the login one, use `useAuth().signup({ redirectTo })`: it calls `loginWithRedirect` with `screen_hint: 'signup'` and `appState: { target: redirectTo }`, so after the callback the app lands on `redirectTo` (default `/`).

### Session lifetime

The SPA keeps the session with **refresh tokens**: the client uses `useRefreshTokens` with `localStorage` cache and logs in with `audience` and `scope: openid profile email offline_access`. Before each API call the module asks Auth0 for the current access token, which is cached and renewed with the refresh token once it expires (2 hours for `https://api.merkaly.io`). When the refresh token is gone or expired, protected surfaces (`requiresAuth: true`) go back to login instead of calling the API without a token. Account linking (`linkWithConnection(connection)`) uses a separate Auth0 client, the `auth.merkaly.io` SPA client in Auth0, with an in-memory cache, created only on the first call (no extra `checkSession` on page load). It opens a login popup for that connection and sends the popup's raw ID token to `POST /auth/identities` as `{ idToken }`; the api verifies the token (signature, issuer, audience = the account linking client, expiry) and links the identity from its `sub` into the logged-in user. Requires an api with that contract (older clients that sent `{ provider, userId }` get `400`).

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

## Notifications and modals

`useNotify()` is the standard for feedback and confirmations in every app:

| Need | Use |
|---|---|
| Short feedback | `$notify.toast({ title, variant })` |
| Confirm an action (text and two buttons) | `$notify.confirm({ title, message, confirmText, cancelText, variant, onConfirm })` |
| Modal with its own content (form, list) | a component with `<BModal>`, opened with `useModal().create({ component: markRaw(component), ...props }).show()` |

```ts
const $notify = useNotify();

$notify.confirm({
  cancelText: $t('actions.back'),
  confirmText: $t('order.cancel.submit'),
  message: $t('order.cancel.confirm'),
  onConfirm: () => cancel({ id }).then(() => !error.value), // false keeps it open (the error is shown by the app)
  title: $t('order.cancel.modalTitle', { number }),
  variant: 'danger',
});
```

- `onConfirm` returning a promise keeps the modal open with both buttons disabled until it settles; it
  closes afterwards unless the promise resolves `false`. Adapters' `execute` resolves on api errors too,
  so check `error` before returning.
- Each call creates its own modal and destroys it when hidden.
- No inline "click again to confirm" and no `<BModal v-model>` in a page: open modals through `create`.
- A component opened by `create` is mounted outside the page tree: pass data as props and answer
  through emits (`onSaved`), never `inject`. Do not use `modelValue` for data: the orchestrator shows the modal through it
  (use a named model such as `v-model:page`). Destroy it on `onHidden` when created from a click.
- Props already set in the app `bootstrap.config.ts` are defaults: do not repeat them.

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
