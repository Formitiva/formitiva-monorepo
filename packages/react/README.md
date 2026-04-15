# @formitiva/react

[![npm](https://img.shields.io/npm/v/@formitiva/react)](https://www.npmjs.com/package/@formitiva/react)

React adapter for **[Formitiva](https://formitiva.com)** — build dynamic, schema-driven forms with a single component.

## Features

- **Single component** — render any form from a JSON schema with `<Formitiva />`
- **25+ built-in field types** — text, email, phone, dropdown, date, file, rating, slider, unit values, and more
- **Dynamic validation** — `onEdit`, `onBlur`, or `onSubmission` modes with built-in and custom validators
- **Conditional visibility** — show/hide fields based on other field values via parent-child relationships
- **Computed values** — derive field values from other fields automatically
- **Plugin system** — register custom components, validators, submission handlers, and visibility rules
- **Theming** — CSS variable-based theming with light/dark support
- **Localization** — 29+ languages with CDN-based translation loading
- **TypeScript** — fully typed API

## Installation

```bash
npm install @formitiva/react
# or
pnpm add @formitiva/react
```

**Peer dependencies:** `react >=17`, `react-dom >=17`

## Quick Start

```tsx
import { Formitiva } from "@formitiva/react";

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

const handleSubmit = (_def, _instanceName, values) => {
  console.log("Submitted:", values);
  return undefined;
};

export default function App() {
  return <Formitiva definitionData={definition} onSubmit={handleSubmit} />;
}
```

## Props

| Prop | Type | Default | Description |
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
| `style` | `CSSProperties` | — | Inline styles for the container |

## Hooks

| Hook | Description |
|---|---|
| `useFormitivaContext()` | Access the current form context (language, theme, t, etc.) |
| `useFieldValidator(field)` | Returns a validation function respecting the current validation mode |
| `useDebouncedCallback(fn, wait)` | Debounced callback with leading/trailing options |
| `useUncontrolledValidatedInput(props)` | Manages uncontrolled inputs with validation and DOM sync |
| `useDropdownPosition(ref)` | Calculates safe popup positioning for dropdowns |
| `useUnitValueField(props)` | Manages unit value state with normalization |

## Extending

### Custom Components

```ts
import { registerComponent } from "@formitiva/react";

registerComponent("my-custom-field", MyCustomFieldComponent);
```

### Custom Validators

```ts
import { registerFieldValidator, registerTypeValidator } from "@formitiva/react";

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
import { registerPlugin } from "@formitiva/react";

registerPlugin({
  name: "my-plugin",
  version: "1.0.0",
  components: { "my-field": MyFieldComponent },
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
