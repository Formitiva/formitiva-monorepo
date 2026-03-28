import type {
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler,
} from '../formitivaTypes';
import BaseRegistry from './baseRegistry';

// ─── Registries ─────────────────────────────────────────────────────────────

const formValidationRegistry = new BaseRegistry<FormValidationHandler>();
const fieldTypeValidationRegistry = new BaseRegistry<FieldTypeValidationHandler>();

// Categorised field-custom validators: category → name → handler
const fieldCustomValidationMap: Record<string, Record<string, FieldCustomValidationHandler>> = {};

// Track built-in type names so they can't be overridden by user plugins
const builtinTypeNames = new Set<string>();

// ─── Form-level validators ───────────────────────────────────────────────────

export function registerFormValidationHandler(name: string, fn: FormValidationHandler): void {
  formValidationRegistry.register(name, fn);
}

export function getFormValidationHandler(name: string): FormValidationHandler | null {
  return formValidationRegistry.get(name) ?? null;
}

export function listFormValidationHandlers(): string[] {
  return formValidationRegistry.list();
}

// ─── Field custom validators ─────────────────────────────────────────────────

export function registerFieldCustomValidationHandler(
  category: string,
  name: string,
  fn: FieldCustomValidationHandler,
): void {
  if (!fieldCustomValidationMap[category]) {
    fieldCustomValidationMap[category] = {};
  }
  fieldCustomValidationMap[category][name] = fn;
}

export function getFieldCustomValidationHandler(
  category: string,
  name: string,
): FieldCustomValidationHandler | null {
  return fieldCustomValidationMap[category]?.[name] ?? null;
}

export function listFieldCustomValidationHandlers(category?: string): string[] {
  if (category) {
    return Object.keys(fieldCustomValidationMap[category] ?? {});
  }
  return Object.keys(fieldCustomValidationMap);
}

// ─── Field type validators ───────────────────────────────────────────────────

/** Register a built-in type validator (cannot be overridden by plugins). */
export function registerBuiltinFieldTypeValidationHandler(
  name: string,
  fn: FieldTypeValidationHandler,
): void {
  builtinTypeNames.add(name);
  fieldTypeValidationRegistry.register(name, fn);
}

/** Register a custom type validator. Cannot override built-in types. */
export function registerFieldTypeValidationHandler(
  name: string,
  fn: FieldTypeValidationHandler,
): void {
  if (builtinTypeNames.has(name)) {
    console.warn(
      `[Formitiva] Cannot override built-in type field validation handler for type "${name}".`,
    );
    return;
  }
  fieldTypeValidationRegistry.register(name, fn);
}

export function getFieldTypeValidationHandler(name: string): FieldTypeValidationHandler | null {
  return fieldTypeValidationRegistry.get(name) ?? null;
}
