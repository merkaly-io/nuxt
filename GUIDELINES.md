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

## 6. **Quick Summary**

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
