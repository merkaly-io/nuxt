# Vue & Nuxt Component Rules

These rules must be applied to **all components**, `.vue` files, templates, and AI‑generated code.

---

## 1. **Prohibited Attributes**
The following attributes must always be removed:

- `data-*`
- `aria-*`
- `name`
- `id`

---

## 2. **Element & Component Formatting**

### 2.1 Inline Elements  
If a tag + all its attributes **does not exceed 120 characters**, it must be written **inline**, like:

```html
<BButton variant="primary" />
```

### 2.2 Self‑Closing Tags  
Always self‑close tags that support it:

```html
<BCard />
```

### 2.3 Spacing Between Sibling Elements  
If two elements are at the **same hierarchical level**, leave **one blank line** between them:

```html
<div></div>

<div></div>
```

### 2.4 Indentation  
Maintain consistent indentation and hierarchy:

- 2 spaces per level  
- Never mix tabs and spaces

---

## 3. **Using BootstrapVueNext**

- Use **only components from BootstrapVueNext**.  
- Reference: https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/components
- Use the **props provided** by each component.
- Use **PascalCase** for all component names:

```html
<BCard>
  <BButton />
</BCard>
```

---

## 4. **Template Best Practices**

### 4.1 Use Variables  
Avoid rendering repeated literal content. Use variables or computed values.

### 4.2 v-for  
- Must always be inside a `<template>`  
- Must always include a `:key`

```html
<template v-for="item in items" :key="item.id">
  <BListGroupItem v-text="item.label" />
</template>
```

### 4.3 v-text Instead of {{ }}  
Use **v-text** instead of curly‑brace interpolation:

✔ Correct:
```html
<p v-text="title" />
```

✘ Incorrect:
```html
<p>{{ title }}</p>
```

---

## 5. **Custom Components**

Custom components must **not** use `v-text` directly.

❌ Incorrect:
```html
<MyComponent v-text="label" />
```

✔ Correct:
```html
<MyComponent>
  <span v-text="label" />
</MyComponent>
```

---

## 6. **State: composables first, Pinia only when it pays off**

Pick the simplest option that covers the need. No app uses Pinia today (admin dropped it); none needs it yet.

| Need | Use |
|---|---|
| Reusable reactive logic: forms, modals, filters, pagination, SDK wrappers, transformations | **Composable** (`useX()`), a new instance per call |
| One instance shared by many components on the client (e.g. the store cart, search state) | **Shared composable**: `createSharedComposable` (VueUse). On the server it is not shared, which is what we want |
| Simple shared state that must survive SSR → client | **`useState`** |
| A single-page flow split into components (e.g. checkout steps) | A composable created in the page and passed with **`provide`/`inject`** |
| A complex domain shared across several routes, with coordinated actions and invariants | **Pinia**, justified in the PR |
| Data that lives in the api (products, orders, payments, settings) | **Adapters** (`withAdapter` from `@merkaly/nuxt`): not `useFetch`/`useAsyncData` directly, and never copied into a store |

Rules:
- **Never module-level `ref`/`reactive` in SSR apps** (store, www): on the server it is shared across requests and tenants. Use `useState`, a shared composable (client) or keep it inside the composable.
- **The backend is the source of truth**: the frontend keeps only client state (cart in `localStorage`, a checkout in progress, temporary selections, local preferences).
- **Auth and the organization come from Auth0** (`useAuth`, `useOrganization`): no store copies them. Changing organization is a new login with a full reload; the store tenant comes from the host.
- **No tokens or private data persisted** in `localStorage`/cookies by our code (the Auth0 SDK handles its own).
- **No Pinia "for the future"**: introduce it only when composables became hard to keep consistent (e.g. a backend-synced cart with coupons, a checkout across several routes), and say why in the PR. A store is one coherent domain, never a bag of variables; no circular stores.
- Do not migrate existing code just to follow this.

---

## 7. **Naming (apps)**

Applies to admin, store, dashboard and www. `@merkaly/nuxt` keeps its public names (`MK` + `<type>/<Type><Thing>`).

- **Folders in singular:** `components/ui/<type>/` (generic primitives), `components/<domain>/` (business pieces, same namespace as `@merkaly/api`: `order/sale/`, `finance/payment/`), `components/layout/` (the app shell; private parts in `layout/.components/`), `pages/<route>/.components/` (private to one page).
- **A file starts with its folder's last segment**, so Nuxt doesn't repeat it and the template name equals the file: `order/sale/SaleStatusBadge.vue` → `<OrderSaleStatusBadge>`, `ui/button/ButtonSubmit.vue` → `<UiButtonSubmit>`.
- **Thing + type suffix** from a closed list: `Card`, `Item` (row in a list), `List`/`Grid`, `Modal`, `Form`, `Fields`, `Section`, `Badge`, `Button`, `Select`, `Dropdown`, `Step`. No `Box`/`Line` synonyms.
- **Singular for one entity, plural only for collections** (`MemberRoleModal`, `MembersCard`); no verbs as suffix (`WithdrawalModal`).
- **Used by more than one page → `components/<domain>/`**; never import from another page's `.components`.
- **Acronyms in PascalCase** (`SectionFaq`).
- **Composables** `use<Domain><Thing>`; **utils** `<domain>.<thing>.ts` lowercase with dots, exporting only what is used outside; non-component files never in `.components`.
- `components/` by auto-import; page `.components`/`.composables` with explicit imports.

---

## 8. **Quick Summary**

- ❌ No `data-*`, `aria-*`, `name`, `id`  
- ✔ Inline tags if <120 chars  
- ✔ Self‑close whenever possible  
- ✔ Blank line between sibling elements  
- ✔ Proper indentation  
- ✔ Use BootstrapVueNext components  
- ✔ PascalCase everywhere  
- ✔ Use component props  
- ✔ Use variables to avoid repetition  
- ✔ `v-for` inside `<template>` + `:key`  
- ✔ Use `v-text`  
- ✔ Custom components → wrap text in `<span v-text="">`  
- ✔ `defineProps` with runtime declaration (`{ type, required, default }`) and `defineEmits` in object form: `close: null` without payload, a typed validator with a simple presence check with payload (`saved: (status: PaymentAccountStatus) => Boolean(status)`; `typeof`/`Array.isArray`/`!== undefined` when a falsy value is valid). Never `defineProps<T>()`, `defineEmits<T>()`, `withDefaults`, the array form `['save']` or `(_value: T) => true`
- ✔ State: composable → shared composable/`useState` → `provide`/`inject` for a page flow → Pinia only for complex multi-route domains (justified); api data through adapters; no module-level state in SSR apps
- ✔ Naming: singular folders (`ui/<type>`, `<domain>`, `layout`), file starts with its folder segment, thing + closed type suffix, shared pieces in `components/`, acronyms in PascalCase
