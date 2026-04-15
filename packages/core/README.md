# @formitiva/core

[![npm](https://img.shields.io/npm/v/@formitiva/core)](https://www.npmjs.com/package/@formitiva/core)

Framework-agnostic shared core for **[Formitiva](https://formitiva.com)** — types, validation, registries, utilities, styles, and themes used by all framework adapters.

> You typically don't install this package directly. It is included as a dependency of `@formitiva/react`, `@formitiva/vue`, `@formitiva/angular`, and `@formitiva/vanilla`. Install it directly only when building a custom adapter or using the validation/utility layer standalone.

## Installation

```bash
npm install @formitiva/core
# or
pnpm add @formitiva/core
```

## What's Inside

### Types & Model

Core TypeScript types that define the form schema:

- **`FormitivaDefinition`** — the root form schema type (fields, groups, validation rules, visibility, computed values)
- **`DefinitionPropertyField`** — individual field definition
- **`FormitivaInstance`** — saved form state with user-entered values
- **`FormitivaProps`** — common props shared by all framework adapters
- **`FieldValidationMode`** — `"onEdit"` | `"onBlur"` | `"onSubmission"`

```ts
import type { FormitivaDefinition, FormitivaInstance } from "@formitiva/core";
```

### 21 Built-in Field Types

`text`, `string`, `multiline`, `password`, `email`, `date`, `time`, `url`, `phone`, `int`, `stepper`, `int-array`, `float`, `slider`, `float-array`, `unit`, `dropdown`, `multi-selection`, `color`, `rating`, `file`

Each type has a built-in validator registered automatically.

### Schema Utilities

```ts
import {
  validateDefinitionSchema,  // validate a definition object
  loadJsonDefinition,         // parse & validate from JSON string
  createInstanceFromDefinition,
  loadInstance,
  upgradeInstanceToLatestDefinition,
  serializeInstance,
  deserializeInstance,
} from "@formitiva/core";
```

### Validation

```ts
import {
  validateField,
  validateFormValues,
  validateFieldWithCustomHandler,
  ensureBuiltinFieldTypeValidatorsRegistered,
} from "@formitiva/core";
```

### Registries

Pluggable registries for extending form behavior:

| Registry | Purpose |
|---|---|
| **Validation handlers** | `registerFieldValidator`, `registerTypeValidator`, `registerFormValidator` |
| **Submission handlers** | `registerSubmitter`, `registerSubmissionHandler` |
| **Button handlers** | `registerButtonHandler`, `getButtonHandler` |
| **Visibility handlers** | `registerVisibilityHandler` — custom show/hide logic |
| **Computed value handlers** | `registerComputedValueHandler` — derive values from other fields |

### Field Visibility & Computed Values

```ts
import {
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  applyVisibilityRefs,
  applyComputedRefs,
} from "@formitiva/core";
```

### Unit Value Mapper

Conversion utilities for `unit` fields across multiple dimensions:

```ts
import {
  dimensionUnitsMap,       // units grouped by dimension
  dimensionUnitFactorsMap, // conversion factors
  dimensionUnitDisplayMap, // display labels
  convertTemperature,
  getUnitFactors,
} from "@formitiva/core";
```

Supported dimensions: length, mass, volume, area, speed, temperature, time, digital storage, frequency, and more.

### Localization — 30 Languages

```ts
import {
  supportedLanguages,
  loadCommonTranslation,
  createTranslationFunction,
} from "@formitiva/core";
```

`en`, `fr`, `de`, `es`, `it`, `pt`, `ja`, `ko`, `zh-cn`, `zh-tw`, `ru`, `uk`, `pl`, `nl`, `sv`, `da`, `no`, `fi`, `cs`, `sk`, `hu`, `ro`, `bg`, `el`, `tr`, `th`, `hi`, `id`, `ms`, `vi`

### Grouping Helpers

```ts
import { groupConsecutiveFields, renameDuplicatedGroups } from "@formitiva/core";
```

### Styles & CSS Classes

```ts
// Programmatic access to all CSS class names
import { CSS_CLASSES, combineClasses } from "@formitiva/core/styles";
```

```css
/* Base stylesheet */
@import "@formitiva/core/styles/formitiva.css";
```

### 20 Built-in Themes

Import any theme CSS file directly:

```css
@import "@formitiva/core/themes/material.css";
@import "@formitiva/core/themes/material-dark.css";
```

Available themes: `ant-design`, `ant-design-dark`, `blueprint`, `blueprint-dark`, `compact-variant`, `fluent`, `glass-morphism`, `high-contrast-accessible`, `ios-mobile`, `macos-native`, `material`, `material-dark`, `midnight-dark`, `modern-light`, `neon-cyber-dark`, `shadcn`, `soft-pastel`, `spacious-variant`, `tailwind`, `tailwind-dark`

Or customize via CSS variables:

```css
:root {
  --formitiva-color-primary: #3b82f6;
  --formitiva-color-error: #ef4444;
  --formitiva-border-radius: 8px;
}
```

## Framework Adapters

| Package | Framework |
|---|---|
| [`@formitiva/react`](https://www.npmjs.com/package/@formitiva/react) | React ≥17 |
| [`@formitiva/vue`](https://www.npmjs.com/package/@formitiva/vue) | Vue ≥3.3 |
| [`@formitiva/angular`](https://www.npmjs.com/package/@formitiva/angular) | Angular ≥18 |
| [`@formitiva/vanilla`](https://www.npmjs.com/package/@formitiva/vanilla) | Vanilla JS |

## Links

- [Documentation](https://formitiva.com/docs)
- [Visual Form Builder](https://formitiva.com/form-builder)
- [GitHub](https://github.com/formitiva/formitiva-monorepo)

## License

MIT
