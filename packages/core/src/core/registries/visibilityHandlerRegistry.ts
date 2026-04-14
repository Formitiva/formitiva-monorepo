import type { FieldValueType, TranslationFunction, FieldVisibilityStatus } from '../formitivaTypes';
import BaseRegistry from './baseRegistry';

/**
 * Visibility handler function type.
 * Receives the field name and all current form values, and returns a visibility status:
 *   'visible'   — field is shown and enabled
 *   'invisible' — field is hidden
 *   'enable'    — field is shown and explicitly enabled (overrides static disabled)
 *   'disable'   — field is shown but disabled
 */
export type VisibilityHandler = (
  fieldName: string,
  valuesMap: Record<string, FieldValueType>,
  t: TranslationFunction,
) => FieldVisibilityStatus;

const registry = new BaseRegistry<VisibilityHandler>();

export function registerVisibilityHandler(handlerName: string, fn: VisibilityHandler): void {
  registry.register(handlerName, fn);
}

export function getVisibilityHandler(handlerName: string): VisibilityHandler | undefined {
  return registry.get(handlerName);
}

export function hasVisibilityHandler(handlerName: string): boolean {
  return registry.has(handlerName);
}

export function unregisterVisibilityHandler(handlerName: string): boolean {
  return registry.unregister(handlerName);
}

export function listVisibilityHandlers(): string[] {
  return registry.list();
}

export default registry;
