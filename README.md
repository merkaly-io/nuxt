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
