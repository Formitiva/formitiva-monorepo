# Formitiva

> Schema-driven forms for React, Vue, Angular, and Vanilla JS.

[![npm](https://img.shields.io/npm/v/@formitiva/core)](https://www.npmjs.com/search?q=%40formitiva)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🤔 What is Formitiva?

Formitiva is a schema-driven form system for modern web applications.

Instead of writing forms in template or JSX code, forms are defined using JSON schemas and rendered dynamically.

```json
{
  "name": "email",
  "type": "email",
  "required": true
}
```

This allows forms to be:

- generated from APIs
- stored in databases
- edited visually
- reused across applications
- updated without redeploying code

Formitiva is designed for applications where forms must be **dynamic, configurable, and extensible** — and it works with your existing framework of choice.

![Formitiva Example](https://raw.githubusercontent.com/Formitiva/react/master/docs/assets/images/formitiva_example.gif)

---

## 🤔 Why Schema-Driven Forms?

Most form libraries assume forms are written directly in code.

Traditional React forms often combine multiple responsibilities inside the same component:

- data structure
- UI rendering
- validation logic
- submission workflows

```javascript
  function UserForm() {
    const handleSubmit = (data) => {
      validatePassword(data);
      api.saveUser(data);
    };

    return (
      <form>
        <input name="username" />
        <input name="password" />
      </form>
    );
  }
```
This approach works well for small forms, but it becomes difficult to scale when:

    many forms exist across a platform
    validation rules must be reused
    forms are generated dynamically
    domain-specific field types are needed

Schema-driven forms attempt to solve this by defining forms using structured data.

---

## 🏗 Architecture

Formitiva is built around three fully decoupled layers.

```
Schema (Data)
      ↓
Registry (UI + Logic Mapping)
      ↓
Renderer (Framework UI)
```

| **Layer** | **Responsibility** |
|---|---|
| Schema | Defines form structure and metadata |
| Registry | Maps schema field types to components and logic |
| Renderer | Dynamically renders the UI |

This separation allows the system to remain **flexible, extensible, and maintainable**.

- schemas can come from APIs
- UI components can be swapped
- logic can be extended via plugins

---

## 🧩 Core Concepts

### Schema

Defines the structure of the form. Contains data only — no UI code.

```json
{
  "name": "country",
  "type": "dropdown",
  "options": [
    { "label": "USA", "value": "US" }
  ]
}
```

### Component Registry

Maps schema field types to UI components and logic. Decouples the schema from the UI implementation.

```ts
registerComponent("email", EmailField);
```

### Renderer

Reads the schema, resolves components through the registry, and produces the final UI output.

---

## 📊 Comparison with Schema-Driven Form Systems

### Cross-Framework Support for JSON Schema Form Libraries
| Library | React | Vue | Angular | Vanilla JS |
|---|:---:|:---:|:---:|:---:|
| react-jsonschema-form | ✅ | ❌ | ❌ | ❌ |
| JSON Forms | ✅ | ✅ | ❌* | ⚠️ |
| Uniforms | ✅ | ❌ | ❌ | ❌ |
| Form.io | ✅ | ✅ | ✅ | ✅ |
| Formitiva | ✅ | ✅ | ✅ | ✅ |

### Data, UI and Logic Decoupling Comparison

| Library | Data | UI | Logic | Decoupling |
|---|---|---|---|---|
| RJSF | JSON Schema | Widgets | Component logic | Medium |
| JSON Forms | JSON Schema | UI Schema | Rules engine | Medium-High |
| Uniforms | Schema adapters | Themes | Component logic | Medium |
| Form.io | JSON definitions | Renderer | Embedded logic | Medium-High |
| Formitiva | Schema definition | Component registry | Registered logic | High |


---

## 🎨 Visual Builder

Formitiva includes a drag-and-drop visual builder for creating schemas.

Capabilities:

- visually build forms
- configure validation and conditional logic
- preview instantly
- export production-ready schemas

<img src="./docs/assets/images/form_builder_ui.png" alt="Formitiva Builder Screenshot" width="900" style="max-width:80%;height:auto;display:block;margin:0.5rem auto;" />

👉 https://formitiva.com/form-builder

---

## ✨ Key Features

- **Schema-Driven Forms** — define forms using structured data instead of templates
- **Decoupled Architecture** — data, UI, and logic are independent layers
- **Runtime Form Rendering** — forms can change dynamically without redeploying
- **Extensibility** — custom components, validators, submission handlers, themes, i18n
- **Conditional Logic** — show/hide fields dynamically based on other field values
- **Theming** — CSS variable-based themes, light/dark modes, customizable styling
- **Internationalization** — built-in translation support with per-form dictionaries
- **Performance & Accessibility** — incremental mounting, batched updates, ARIA-compliant components

---

## 📦 Packages

| Package | Framework | npm |
|---|---|---|
| [`@formitiva/core`](packages/core) | Framework-agnostic | [![npm](https://img.shields.io/npm/v/@formitiva/core)](https://www.npmjs.com/package/@formitiva/core) |
| [`@formitiva/react`](packages/react) | React ≥ 17 | [![npm](https://img.shields.io/npm/v/@formitiva/react)](https://www.npmjs.com/package/@formitiva/react) |
| [`@formitiva/vue`](packages/vue) | Vue ≥ 3.3 | [![npm](https://img.shields.io/npm/v/@formitiva/vue)](https://www.npmjs.com/package/@formitiva/vue) |
| [`@formitiva/angular`](packages/angular) | Angular ≥ 18 | [![npm](https://img.shields.io/npm/v/@formitiva/angular)](https://www.npmjs.com/package/@formitiva/angular) |
| [`@formitiva/vanilla`](packages/vanilla) | Vanilla JS / any | [![npm](https://img.shields.io/npm/v/@formitiva/vanilla)](https://www.npmjs.com/package/@formitiva/vanilla) |

---

## 🚀 Installation & Quick Start

### React

```bash
npm install @formitiva/react
```

Peer dependencies: `react ^17 || ^18 || ^19`, `react-dom ^17 || ^18 || ^19`

```tsx
import { Formitiva } from "@formitiva/react";

const definition = {
  name: "contactForm",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email",    type: "email", required: true }
  ]
};

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  console.log('Form submitted with values:', values);
  return undefined; // no errors → form submitted successfully
};

export default function App() {
  return <Formitiva definitionData={definition} onSubmit={handleSubmit} />;
}
```

---

### Vue

```bash
npm install @formitiva/vue
```

Peer dependencies: `vue ^3.3`

```vue
<script setup lang="ts">
import { Formitiva } from "@formitiva/vue";

const definition = {
  name: "contactForm",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email",    type: "email", required: true }
  ]
};

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  console.log('Form submitted with values:', values);
  return undefined; // no errors → form submitted successfully
};

</script>

<template>
  <Formitiva :definition-data="definition" :on-submit="handleSubmit" />
</template>
```

---

### Angular

```bash
npm install @formitiva/angular
```

Peer dependencies: `@angular/core ^18`, `@angular/common ^18`, `@angular/forms ^18`, `rxjs ^7`

```typescript
// app.module.ts
import { FormitivaModule } from "@formitiva/angular";

@NgModule({
  imports: [FormitivaModule]
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<formitiva-form [definitionData]="definition" [formSubmit="handleSubmit" />
```

```typescript
// app.component.ts
import { Component } from "@angular/core";

@Component({ templateUrl: "./app.component.html" })
export class AppComponent {
  definition = {
    name: "contactForm",
    properties: [
      { name: "fullName", type: "text", required: true },
      { name: "email",    type: "email", required: true }
    ]
  };

  handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    console.log('Form submitted with values:', values);
    return undefined; // no errors → form submitted successfully
  };
}
```

---

### Vanilla JS

```bash
npm install @formitiva/vanilla
```

No framework peer dependencies required.

```typescript
import { Formitiva } from "@formitiva/vanilla";

const definition = {
  name: "contactForm",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email",    type: "email", required: true }
  ]
};

const container = document.getElementById("form-root")!; // Suppose form-root is the parent node

const form = new Formitiva({
  definitionData: definition,
  onSubmit: (_def, _instanceName, values) => {
    console.log('Form submitted with values:', values);
    return undefined; // no errors
  },
});

(async () => {
  await form.mount(container);
})();
```

---

## 🎭 Conditional Logic

Fields can be dynamically shown or hidden based on other field values — works identically across all frameworks.

```json
{
  "name": "state",
  "type": "dropdown",
  "parents": {
    "country": ["US"]
  }
}
```

The `state` field is only displayed when `country` equals `"US"`.

---

## 🔒 Validation

Supported validation modes:

- `onEdit` — validate as the user types
- `onBlur` — validate when leaving a field
- `onSubmission` — validate on form submit

Validation types:

- field-level validation
- form-level validation
- built-in type validators
- custom validators via the registry

---

## 📤 Submission Handling

**Direct callback** — works like other form libraries:

```tsx
<Formitiva definitionData={definition} onSubmit={submitFunction} />
```

**Registered handlers** — fully decouples submission logic from the form UI:

```ts
registerSubmissionHandler("api:saveForm", async (data) => {
  await fetch("/api/form", { method: "POST", body: JSON.stringify(data) });
});
```

Referenced in schema:

```json
{
  "submitHandlerName": "api:saveForm"
}
```

---

## 📚 Documentation

Full documentation in React: https://formitiva.com/docs

---

## 👥 Use Cases

Formitiva is designed for **dynamic or configurable UI systems**.

Common scenarios:

- SaaS settings pages
- admin dashboards
- CMS-driven forms
- product configurators
- low-code platforms
- enterprise dynamic UIs

---

## 🗺 Roadmap

- schema versioning
- multi-step forms
- advanced conditional logic
- layout system (grid, tabs, steps)
- visual logic editor
- plugin marketplace

---

## 🤝 Contributing

Contributions are welcome. Open an issue or submit a pull request at:

https://github.com/formitiva/formitiva-monorepo

For internal monorepo development setup, see [DEVELOPMENT.md](DEVELOPMENT.md).
