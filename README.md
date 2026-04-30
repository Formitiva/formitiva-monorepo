# Formitiva

**Build dynamic, schema-driven forms across React, Vue, Angular, and Vanilla JS — fully decoupling data, UI, and logic.**

## Overview

**Formitiva** is a **framework-agnostic runtime form engine** for building forms from **JSON schemas**. The same definition can be rendered in React, Vue, Angular, or Vanilla JS without rewriting the form UI or business logic.

Formitiva is perfect for:

- Dynamic, backend-driven forms
- Low-code or visual form editors
- Reusable form components across multiple projects
- Enterprise-grade applications requiring extensible, maintainable form workflows

---

## Why Formitiva?

Traditional form development often mixes **data, UI, and logic**, which makes forms harder to maintain and extend. Formitiva separates these concerns:

- Schema (Data): Form structure and metadata
- Registry (UI + Logic Mapping): Connects schema fields to UI components and behaviors
- Renderer (Framework UI): Dynamically renders forms in React, Vue, Angular, or Vanilla JS

This architecture allows you to:

- Dynamically generate forms at runtime
- Swap or extend UI components easily
- Add conditional logic, validation, and plugins without touching schemas
- Keep forms maintainable across projects and teams

---

## Core Features

- Framework-Agnostic: Supports React, Vue, Angular, and Vanilla JS
- Dynamic Validation & Conditional Logic: Fields and sections can adapt in real-time
- Plugin System & Extensibility: Add custom components, field types, or validation rules
- Runtime Configurable: Forms can be sourced from APIs, databases, CMS, or code
- Decoupled Architecture: Separates schema, UI, and logic for scalability and maintainability

---

## Architecture

Formitiva is built around three decoupled layers:

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

This separation keeps the system **flexible, extensible, and maintainable**.

- Schemas can come from APIs
- UI components can be swapped
- Logic can be extended via plugins

---

## Core Concepts

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

## Packages

| Package | Framework | npm |
|---|---|---|
| [`@formitiva/core`](packages/core) | Framework-agnostic | [![npm](https://img.shields.io/npm/v/@formitiva/core)](https://www.npmjs.com/package/@formitiva/core) |
| [`@formitiva/react`](packages/react) | React ≥ 17 | [![npm](https://img.shields.io/npm/v/@formitiva/react)](https://www.npmjs.com/package/@formitiva/react) |
| [`@formitiva/vue`](packages/vue) | Vue ≥ 3.3 | [![npm](https://img.shields.io/npm/v/@formitiva/vue)](https://www.npmjs.com/package/@formitiva/vue) |
| [`@formitiva/angular`](packages/angular) | Angular ≥ 18 | [![npm](https://img.shields.io/npm/v/@formitiva/angular)](https://www.npmjs.com/package/@formitiva/angular) |
| [`@formitiva/vanilla`](packages/vanilla) | Vanilla JS / any | [![npm](https://img.shields.io/npm/v/@formitiva/vanilla)](https://www.npmjs.com/package/@formitiva/vanilla) |

---

## Installation & Quick Start

Framework packages re-export the shared core APIs, so you usually only install the framework package you use. Built-in theme CSS files are separate assets and should be imported from `@formitiva/core/themes/*`, for example:

```ts
import '@formitiva/core/themes/material-dark.css';
```

### React

```bash
npm install @formitiva/react
```

Peer dependencies: `react ^17 || ^18 || ^19`, `react-dom ^17 || ^18 || ^19`

```tsx
import { Formitiva } from "@formitiva/react";

const definition = {
  name: "contactForm",
  version: "1.0.0",
  displayName: "Contact Form",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email",    type: "email", required: true }
  ]
};

const handleSubmit = (_def, _instanceName, values) => {
  console.log('Form submitted with values:', values);
  return undefined;
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
  version: "1.0.0",
  displayName: "Contact Form",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email",    type: "email", required: true }
  ]
};

const handleSubmit = (_def, _instanceName, values) => {
  console.log('Form submitted with values:', values);
  return undefined;
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

Peer dependencies: `@angular/core >=18`, `@angular/common >=18`, `@angular/forms >=18`, `rxjs >=7`

```typescript
import { Component } from "@angular/core";
import { FormitivaComponent } from "@formitiva/angular";

const definition = {
  name: "contactForm",
  version: "1.0.0",
  displayName: "Contact Form",
  properties: [
    { name: "fullName", type: "text", required: true },
    { name: "email", type: "email", required: true }
  ]
};

@Component({
  selector: "app-home",
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <fv-formitiva
      [definitionData]="definition"
      [onSubmit]="handleSubmit"
      theme="material-dark"
    ></fv-formitiva>
  `,
})
export class AppComponent {
  definition = definition;

  handleSubmit = (_def, _instanceName, values) => {
    console.log('Form submitted with values:', values);
    return undefined;
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
  version: "1.0.0",
  displayName: "Contact Form",
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

## Conditional Logic

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

## Validation

Supported validation modes:

- `onEdit` — validate as the user types
- `onBlur` — validate when leaving a field
- `onSubmission` — validate on form submit

Validation types:

- Field-level validation
- Form-level validation
- Built-in type validators
- Custom validators via the registry

---

## Submission Handling

**Direct callback** — works like other form libraries:

```tsx
<Formitiva definitionData={definition} onSubmit={submitFunction} />
```

**Registered handlers** — fully decouples submission logic from the form UI:

```ts
registerSubmitter("api:saveForm", async (data) => {
  await fetch("/api/form", { method: "POST", body: JSON.stringify(data) });
});
```

Referenced in schema:

```json
{
  "submitterRef": "api:saveForm"
}
```

---

## Learn More

- [Official site](https://formitiva.com)
- [Documentation](https://formitiva.com/docs)
- [Schema-Driven Forms Guide](https://dev.to/yanggmtl/schema-driven-framework-agnostic-forms-building-a-runtime-engine-for-react-vue-angular--3o26?utm_source=chatgpt.com)
- [Decouple Data, UI, and Logic](https://dev.to/yanggmtl/decouple-data-ui-and-logic-in-react-forms-using-the-formitiva-registry-system-67n)

---

## Visual Builder

Formitiva provides a drag-and-drop visual builder for creating schemas.

Capabilities:

- Visually build forms
- Configure validation and conditional logic
- Preview instantly
- Export production-ready schemas

👉 https://formitiva.com/form-builder

---


## Development

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 9 (`npm install -g pnpm`)

### Install dependencies

```bash
pnpm install
```

---

### Build packages

Build all packages at once (respects dependency order via Turborepo):

```bash
pnpm build
```

Build individual packages:

```bash
pnpm build:core       # @formitiva/core
pnpm build:react      # @formitiva/react
pnpm build:vue        # @formitiva/vue
pnpm build:angular    # @formitiva/angular
pnpm build:vanilla    # @formitiva/vanilla
```

### Run tests

```bash
pnpm test
```

### Lint

```bash
pnpm lint
```

---

### Build examples

Each example app depends on the workspace packages, so build the packages first.

```bash
# React example (Vite)
pnpm --filter formitiva-react-demo build

# Vue example (Vite)
pnpm --filter formitiva-vue-demo build

# Angular example (Angular CLI)
pnpm --filter formitiva-angular-demo build
```

Preview a built example locally:

```bash
pnpm --filter formitiva-react-demo preview
pnpm --filter formitiva-vue-demo preview
```

Start an example in development mode (packages are rebuilt on change via `pnpm dev`):

```bash
pnpm dev
```

Publish:

```bash
pnpm publish --filter "@formitiva/*" -r
```
---

## 🤝 Looking for Contributors

Formitiva was originally built with a strong focus on the React renderer. Support for Vue, Angular, and Vanilla JS is available, but these adapters would benefit from deeper ecosystem expertise and ongoing maintenance.

We are looking for contributors experienced with:

- Vue
- Angular
- Vanilla JavaScript

### Where help is needed

- Ensuring idiomatic patterns for each framework
- Fixing framework-specific bugs and edge cases
- Improving performance and reactivity handling
- Keeping feature parity across all renderers
- Enhancing documentation and examples

### Getting involved

- Pick up issues labeled by framework (vue, angular, vanilla)
- Open discussions for design improvements
- Submit pull requests for fixes or enhancements

For development setup and architecture details, see DEVELOPMENT.md.


## Learn More

https://formitiva.com
https://formitiva.com/docs

## Development

See DEVELOPMENT.md
