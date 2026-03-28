import type { FieldValueType, ErrorType, TranslationFunction } from '../formitivaTypes';
import BaseRegistry from './baseRegistry';

/**
 * Button handler function type.
 * Receives all form values, a change callback, an error callback and the translation fn.
 */
export type ButtonHandler = (
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: ErrorType) => void,
  t: TranslationFunction,
) => void | Promise<void>;

const registry = new BaseRegistry<ButtonHandler>();

export function registerButtonHandler(handlerName: string, fn: ButtonHandler): void {
  registry.register(handlerName, fn);
}

export function getButtonHandler(handlerName: string): ButtonHandler | undefined {
  return registry.get(handlerName);
}

export function hasButtonHandler(handlerName: string): boolean {
  return registry.has(handlerName);
}

export function unregisterButtonHandler(handlerName: string): boolean {
  return registry.unregister(handlerName);
}

export function listButtonHandlers(): string[] {
  return registry.list();
}

export default registry;
