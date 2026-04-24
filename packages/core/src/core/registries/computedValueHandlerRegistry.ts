import type { FieldValueType, TranslationFunction } from '../formitivaTypes';
import BaseRegistry from './baseRegistry';

/**
 * Computed value handler function type.
 *
 * Receives the triggered field name and the current form values map, and returns either:
 *   - A single `FieldValueType` value — stored under the triggering field's name.
 *   - A `Record<string, FieldValueType>` map — all entries are merged into the values map.
 *     Use this when one handler derives multiple dependent fields in a single pass
 *     (avoids stale-read problems when computed fields depend on other computed fields).
 *   - `undefined` — leaves the current value unchanged.
 *
 * Example – single field:
 *   (fieldName, valuesMap) => Number(valuesMap['quantity']) * Number(valuesMap['unitPrice'])
 *
 * Example – multiple fields (total + finalPrice in one shot):
 *   (_fieldName, valuesMap) => {
 *     const total = Number(valuesMap['quantity']) * Number(valuesMap['unitPrice']);
 *     const finalPrice = total * (1 - Number(valuesMap['discountPct']) / 100);
 *     return { total, finalPrice };
 *   }
 */
export type ComputedValueHandler = (
  fieldName: string,
  valuesMap: Record<string, FieldValueType>,
  t: TranslationFunction,
) => FieldValueType | Record<string, FieldValueType> | undefined;

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
