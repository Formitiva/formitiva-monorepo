# @formitiva/angular

[![npm](https://img.shields.io/npm/v/@formitiva/angular)](https://www.npmjs.com/package/@formitiva/angular)

Angular adapter for **[Formitiva](https://formitiva.com)** — build dynamic, schema-driven forms with a single component.

## Features

- **Single component** — render any form from a JSON schema with `<fv-formitiva />`
- **Standalone components** — works with both standalone and NgModule-based apps
- **25+ built-in field types** — text, email, phone, dropdown, date, file, rating, slider, unit values, and more
- **Angular signals** — context management powered by Angular signals
- **Dynamic validation** — `onEdit`, `onBlur`, or `onSubmission` modes with built-in and custom validators
- **Conditional visibility** — show/hide fields based on other field values via parent-child relationships
- **Computed values** — derive field values from other fields automatically
- **Plugin system** — register custom components, validators, submission handlers, and visibility rules
- **Theming** — CSS variable-based theming with light/dark support
- **Localization** — 29+ languages with CDN-based translation loading
- **TypeScript** — fully typed API

## Installation

```bash
npm install @formitiva/angular
# or
pnpm add @formitiva/angular
```

**Peer dependencies:** `@angular/core >=18`, `@angular/common >=18`, `@angular/forms >=18`, `rxjs >=7`

## Quick Start

### Standalone Component

```typescript
import { Component } from "@angular/core";
import { FormitivaComponent } from "@formitiva/angular";

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

@Component({
  selector: "app-root",
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <fv-formitiva
      [definitionData]="definition"
      [onSubmit]="handleSubmit"
    ></fv-formitiva>
  `,
})
export class AppComponent {
  definition = definition;

  handleSubmit = (_def: any, _instanceName: any, values: any) => {
    console.log("Submitted:", values);
    return undefined;
  };
}
```

### NgModule

```typescript
import { NgModule } from "@angular/core";
import { FormitivaModule } from "@formitiva/angular";

@NgModule({
  imports: [FormitivaModule],
})
export class AppModule {}
```

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `definitionData` | `string \| object \| FormitivaDefinition` | — | Form schema (JSON string, object, or typed definition) |
| `instance` | `FormitivaInstance` | — | Optional saved instance with pre-filled values |
| `language` | `string` | `"en"` | Language code for localization |
| `theme` | `string` | `"light"` | Theme name (`"light"` or `"dark"`) |
| `fieldValidationMode` | `FieldValidationMode` | `"onEdit"` | When to validate: `"onEdit"`, `"onBlur"`, or `"onSubmission"` |
| `displayInstanceName` | `boolean` | `true` | Show an editable instance name field |
| `onSubmit` | `FormSubmissionHandler` | — | Callback on form submission |
| `onValidation` | `FormValidationHandler` | — | Cross-field validation callback |

## Services

| Service | Description |
|---|---|
| `FormitivaContextService` | Provides form context via Angular signals (language, theme, translation function, etc.) |
| `FieldValidatorService` | Validates fields respecting the current validation mode (change, blur, sync triggers) |

## Exported Components

- `FormitivaComponent` — main form entry point (`<fv-formitiva>`)
- `FormitivaRendererComponent` — internal renderer
- All field components (text, email, dropdown, checkbox, etc.)
- `StandardFieldLayoutComponent`, `FieldRendererComponent`, `FieldGroupComponent`

## Extending

### Custom Validators

```ts
import { registerFieldValidator, registerTypeValidator } from "@formitiva/angular";

registerFieldValidator("myForm", "validateAge", (fieldName, value, t) => {
  if (Number(value) < 18) return t("Must be at least 18");
  return undefined;
});
```

### Submission Handlers

```ts
import { registerSubmitter } from "@formitiva/angular";

registerSubmitter("api:saveForm", async (definition, instanceName, values, t) => {
  await fetch("/api/form", { method: "POST", body: JSON.stringify(values) });
  return undefined;
});
```

## Themes

Import a built-in theme CSS file from `@formitiva/core`:

```ts
import "@formitiva/core/themes/material-dark.css";
```

Or in `angular.json`:

```json
{
  "styles": ["node_modules/@formitiva/core/themes/material-dark.css"]
}
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
