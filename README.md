# Formitiva Monorepo

A **pnpm workspaces + Turborepo** monorepo containing four framework adapters that all share the same core library.

```
formitiva-monorepo/
├── packages/
│   ├── core/        @formitiva/core    — framework-agnostic shared code
│   ├── react/       @formitiva/react   — React adapter
│   ├── vue/         @formitiva/vue     — Vue 3 adapter
│   ├── angular/     @formitiva/angular — Angular adapter
│   └── vanilla/     @formitiva/vanilla — Vanilla JS adapter
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

---

## Architecture

### `@formitiva/core`  ← single source of truth
Contains **all framework-agnostic code** that was previously duplicated across four packages:

| Directory | Contents |
|-----------|----------|
| `src/core/` | Types, model, field-visibility logic, form submission, env flag |
| `src/core/registries/` | BaseRegistry, ValidationHandlerRegistry, ButtonHandlerRegistry, SubmissionHandlerRegistry |
| `src/validation/` | Field & form validation engine + all built-in validators |
| `src/utils/` | Serializers, grouping helpers, translation utilities, unit mapper |
| `src/styles/` | CSS class constants, theme utilities, base `formitiva.css` |
| `src/themes/` | All 20+ ready-made theme CSS files |

### Framework packages
Each framework package **imports from `@formitiva/core`** and adds only what is specific to that framework:

| Package | Adds |
|---------|------|
| `@formitiva/react` | React components, React hooks, React component registry, plugin registry |
| `@formitiva/vue` | Vue SFCs, Vue composables, Vue component registry, plugin registry |
| `@formitiva/angular` | Angular module/components/services, Angular component registry |
| `@formitiva/vanilla` | DOM factory functions, field widget abstraction, context provider |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- pnpm ≥ 9 — install with `npm i -g pnpm`

### Install
```bash
pnpm install
```

### Build all packages
```bash
pnpm build
# or individually:
pnpm build:core
pnpm build:react
pnpm build:vue
pnpm build:angular
pnpm build:vanilla
```

### Development (watch mode)
```bash
pnpm dev
```

---

## Migrating from `new-bundle/`

The current `new-bundle/` directory contains four standalone `-src` packages. To complete the migration:

### Step 1 — Core is already done
All shared code has been moved to `packages/core/src/`. The files that were identical across the four packages are now **one copy**.

### Step 2 — Move framework-specific source code

For each framework package you need to copy the **non-shared** directories:

#### React (`packages/react/src/`)
```
cp -r new-bundle/react-src/components/   packages/react/src/components/
cp -r new-bundle/react-src/hooks/        packages/react/src/hooks/
cp    new-bundle/react-src/global.d.ts   packages/react/src/global.d.ts
# Then copy the registries that reference React components:
cp    new-bundle/react-src/core/registries/componentRegistry.ts  packages/react/src/core/registries/componentRegistry.ts
cp    new-bundle/react-src/core/registries/pluginRegistry.ts     packages/react/src/core/registries/pluginRegistry.ts
```

#### Vue (`packages/vue/src/`)
```
cp -r new-bundle/vue-src/components/    packages/vue/src/components/
cp -r new-bundle/vue-src/hooks/         packages/vue/src/hooks/
cp    new-bundle/vue-src/global.d.ts    packages/vue/src/global.d.ts
cp    new-bundle/vue-src/core/registries/componentRegistry.ts  packages/vue/src/core/registries/componentRegistry.ts
cp    new-bundle/vue-src/core/registries/pluginRegistry.ts     packages/vue/src/core/registries/pluginRegistry.ts
```

#### Vanilla (`packages/vanilla/src/`)
```
cp -r new-bundle/vanilla-src/components/       packages/vanilla/src/components/
cp -r new-bundle/vanilla-src/hooks/            packages/vanilla/src/hooks/
cp -r new-bundle/vanilla-src/context/          packages/vanilla/src/context/
cp    new-bundle/vanilla-src/core/fieldWidget.ts  packages/vanilla/src/core/fieldWidget.ts
cp    new-bundle/vanilla-src/global.d.ts       packages/vanilla/src/global.d.ts
cp    new-bundle/vanilla-src/core/registries/componentRegistry.ts  packages/vanilla/src/core/registries/componentRegistry.ts
cp    new-bundle/vanilla-src/core/registries/pluginRegistry.ts     packages/vanilla/src/core/registries/pluginRegistry.ts
```

#### Angular (`packages/angular/src/`)
```
cp -r new-bundle/angular-src/lib/components/  packages/angular/src/components/
cp -r new-bundle/angular-src/lib/services/    packages/angular/src/services/
cp    new-bundle/angular-src/lib/formitiva.module.ts  packages/angular/src/formitiva.module.ts
cp    new-bundle/angular-src/lib/core/registries/component-registry.ts  packages/angular/src/core/registries/component-registry.ts
cp    new-bundle/angular-src/lib/core/registries/plugin-registry.ts     packages/angular/src/core/registries/plugin-registry.ts
```

### Step 3 — Update imports in the framework-specific files

After copying, update relative imports in the framework files from:
```typescript
// OLD (in react-src)
import { FormitivaDefinition } from '../core/formitivaTypes';
import { validateField } from '../validation/validation';
import { BaseRegistry } from '../core/registries/baseRegistry';
```
to:
```typescript
// NEW (in packages/react)
import type { FormitivaDefinition } from '@formitiva/core';
import { validateField } from '@formitiva/core';
import { BaseRegistry } from '@formitiva/core';
```

### Step 4 — Uncomment exports in `src/index.ts`

Each framework package's `src/index.ts` has commented-out exports. Uncomment them as you add the source files.

---

## Package Dependency Graph

```
@formitiva/react   ──┐
@formitiva/vue     ──┤──▶  @formitiva/core
@formitiva/angular ──┤
@formitiva/vanilla ──┘
```

`@formitiva/core` has **zero runtime dependencies** — it is pure TypeScript with no framework coupling.

---

## What changed in `validationHandlerRegistry`

The shared `validationHandlerRegistry` in core no longer imports `isBuiltinComponentType` from a component registry (which was a circular dependency risk). Instead, it maintains its own internal `builtinTypeNames` Set. Call `registerBuiltinFieldTypeValidationHandler` (instead of `registerFieldTypeValidationHandler`) when registering handlers for built-in field types — this atomically registers the handler AND marks the type as protected.
