# @formitiva/vanilla

[![npm](https://img.shields.io/npm/v/@formitiva/vanilla)](https://www.npmjs.com/package/@formitiva/vanilla)

Vanilla JavaScript adapter for **[Formitiva](https://formitiva.com)** — build dynamic, schema-driven forms without any framework dependency.

## Features

- **Zero framework dependency** — works in any JavaScript environment
- **Class-based API** — instantiate a `Formitiva` form and mount it to any DOM element
- **25+ built-in field types** — text, email, phone, dropdown, date, file, rating, slider, unit values, and more
- **Dynamic validation** — `onEdit`, `onBlur`, or `onSubmission` modes with built-in and custom validators
- **Conditional visibility** — show/hide fields based on other field values via parent-child relationships
- **Computed values** — derive field values from other fields automatically
- **Plugin system** — register custom widgets, validators, submission handlers, and visibility rules
- **Theming** — CSS variable-based theming with light/dark support
- **Localization** — 29+ languages with CDN-based translation loading
- **TypeScript** — fully typed API

## Installation

```bash
npm install @formitiva/vanilla
# or
pnpm add @formitiva/vanilla
```

No framework peer dependencies required.

## Quick Start

```ts
import { Formitiva } from "@formitiva/vanilla";

const definition = {
  name: "contactForm",
  version: "1.0.0",
  displayName: "Contact Form",
  properties: [
    { name: "fullName", displayName: "Full Name", type: "text", defaultValue: "", required: true },
    { name: "email", displayName: "Email", type: "email", defaultValue: "", required: true },
    { name: "message", displayName: "Message", type: "multiline", defaultValue: "" },
  ],
};

const form = new Formitiva({
  definitionData: definition,
  onSubmit: (_def, _instance, values) => {
    console.log("Submitted:", values);
    return undefined;
  },
});

await form.mount(document.getElementById("form-container")!);
```

```html
<div id="form-container"></div>
<script type="module" src="./main.ts"></script>
```

## Constructor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `definitionData` | `string \| object \| FormitivaDefinition` | — | Form schema (JSON string, object, or typed definition) |
| `instance` | `FormitivaInstance` | — | Optional saved instance with pre-filled values |
| `language` | `string` | `"en"` | Language code for localization |
| `theme` | `string` | `"light"` | Theme name (`"light"` or `"dark"`) |
| `fieldValidationMode` | `FieldValidationMode` | `"onEdit"` | When to validate: `"onEdit"`, `"onBlur"`, or `"onSubmission"` |
| `displayInstanceName` | `boolean` | `true` | Show an editable instance name field |
| `onSubmit` | `FormSubmissionHandler` | — | Callback on form submission |
| `onValidation` | `FormValidationHandler` | — | Cross-field validation callback |
| `className` | `string` | — | Additional CSS class for the container |
| `style` | `object` | — | Inline styles for the container |

## Advanced Layouts

Pass `layout` to let the Vanilla app choose nav, tab, or wizard presentation while the JSON schema remains focused on field data. The same `definitionData` can be rendered as a default form, a left-nav form, tabs, or wizard steps.

```ts
import { Formitiva } from "@formitiva/vanilla";

const definition = {
  name: "profile",
  version: "1.0.0",
  properties: [
    { name: "firstName", type: "text", displayName: "First Name", required: true },
    { name: "lastName", type: "text", displayName: "Last Name", required: true },
    { name: "email", type: "email", displayName: "Email", required: true },
    { name: "newsletter", type: "switch", displayName: "Newsletter" },
  ],
};

const tabLayout = {
  name: "profileTabs",
  type: "tab" as const,
  displayName: "Profile Tabs",
  defaultValue: "personal",
  sections: [
    { label: "Personal", name: "personal", props: ["firstName", "lastName"] },
    { label: "Contact", name: "contact", props: ["email", "newsletter"] },
  ],
};

const form = new Formitiva({
  definitionData: definition,
  layout: tabLayout,
});
```

Layout types:

| Type | Behavior |
|---|---|
| `"nav"` | Left-side navigation; each item renders its section fields |
| `"tab"` | Tab buttons above the form; switching tabs changes the active section |
| `"wizard"` | Step-by-step flow; Next is disabled while the current step has errors |

Each `sections[].props` entry must match field `name` values from the schema. `definition.layoutRef` and `registerLayout()` still work as a compatibility fallback, but new Vanilla code should pass `layout` directly.

## API

### Formitiva class

```ts
const form = new Formitiva(options);

// Mount the form into a DOM element
await form.mount(container: HTMLElement);

// Unmount the form
form.unmount();
```

### Utilities

| Export | Description |
|---|---|
| `createFormitivaRenderer(options)` | Lower-level renderer factory for custom integration |
| `createDefaultContext()` | Creates a default form context (language, theme, translations) |
| `FormContext` | Context type/constructor for advanced usage |
| `createFieldValidator(field)` | Returns a validation function for a field |
| `createDebouncedCallback(fn, wait)` | Debounced callback utility |

### Widget Types

| Type | Description |
|---|---|
| `FieldWidget` | Interface for implementing custom field widgets |
| `ButtonFieldWidget` | Interface for button-type widgets |

## Extending

### Custom Widgets

```ts
import { registerComponent } from "@formitiva/vanilla";

const myWidget = {
  render(container, field, context) {
    // Render your custom field into the container
  },
  getValue() {
    // Return current value
  },
  destroy() {
    // Clean up
  },
};

registerComponent("my-custom-field", myWidget);
```

### Custom Validators

```ts
import { registerFieldValidator, registerTypeValidator } from "@formitiva/vanilla";

// Per-definition field validator
registerFieldValidator("myForm", "validateAge", (fieldName, value, t) => {
  if (Number(value) < 18) return t("Must be at least 18");
  return undefined;
});

// Global type validator
registerTypeValidator("currency", (field, input, t) => {
  if (Number.isNaN(Number(input))) return t("Must be a valid number");
  return undefined;
});
```

### Plugins

```ts
import { registerPlugin } from "@formitiva/vanilla";

registerPlugin({
  name: "my-plugin",
  version: "1.0.0",
  components: { "my-field": myWidget },
  fieldTypeValidators: { "my-field": myValidator },
});
```

## Themes

Import a built-in theme CSS file from `@formitiva/core`:

```ts
import "@formitiva/core/themes/material-dark.css";
```

Or customize via CSS variables:

```css
:root {
  --formitiva-color-primary: #3b82f6;
  --formitiva-color-error: #ef4444;
  --formitiva-border-radius: 8px;
}
```

## Links

- [Documentation](https://formitiva.com/docs)
- [Visual Form Builder](https://formitiva.com/form-builder)
- [GitHub](https://github.com/formitiva/formitiva-monorepo)
- [Monorepo README](https://github.com/formitiva/formitiva-monorepo#readme)

## License

MIT
