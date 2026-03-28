/**
 * Vanilla JS context system for Formitiva.
 * Replaces the React Context / useFormitivaContext hook.
 *
 * FormContext is a plain object passed directly via function parameters
 * or stored in closures — no React dependency required.
 */

import type { FieldValidationMode, TranslationFunction } from '@formitiva/core';

export interface FormContext {
  definitionName: string;
  language: string;
  theme: string;
  formStyle: Record<string, Record<string, unknown>>;
  fieldStyle: Record<string, Record<string, unknown>>;
  t: TranslationFunction;
  fieldValidationMode: FieldValidationMode;
  displayInstanceName: boolean;
}

/**
 * Create a default/empty context for use in standalone field components.
 * All fields should be created with the context from the Formitiva instance.
 */
export function createDefaultContext(): FormContext {
  return {
    definitionName: '',
    language: 'en',
    theme: 'light',
    formStyle: {},
    fieldStyle: {},
    t: (text) => text,
    fieldValidationMode: 'onEdit',
    displayInstanceName: true,
  };
}
