import type { FieldValueType, TranslationFunction } from '../formitivaTypes';
import BaseRegistry from './baseRegistry';

/**
 * Computed value handler function type.
 * Receives the field name and all current form values, and returns a new
 * computed value for that field, or `undefined` to leave the current value unchanged.
 *
 * Example – compute a total price from quantity and unit price:
 *   (fieldName, valuesMap) => Number(valuesMap['quantity']) * Number(valuesMap['unitPrice'])
 */
export type ComputedValueHandler = (
  fieldName: string,
  valuesMap: Record<string, FieldValueType>,
  t: TranslationFunction,
) => FieldValueType | undefined;

const registry = new BaseRegistry<ComputedValueHandler>();

export function registerComputedValueHandler(handlerName: string, fn: ComputedValueHandler): void {
  registry.register(handlerName, fn);
}

export function getComputedValueHandler(handlerName: string): ComputedValueHandler | undefined {
  return registry.get(handlerName);
}

export function hasComputedValueHandler(handlerName: string): boolean {
  return registry.has(handlerName);
}

export function unregisterComputedValueHandler(handlerName: string): boolean {
  return registry.unregister(handlerName);
}

export function listComputedValueHandlers(): string[] {
  return registry.list();
}

export default registry;
