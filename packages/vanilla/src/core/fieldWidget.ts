/**
 * Core interface for vanilla JS field widgets.
 * Every field factory returns a FieldWidget.
 */
import type { DefinitionPropertyField, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../context/formitivaContext';

export interface FieldWidget {
  /** Root DOM element rendered for this field */
  el: HTMLElement;
  /** Update the displayed value and/or error state */
  update(value: FieldValueType, error: string | null, disabled: boolean): void;
  /** Clean up event listeners and resources */
  destroy(): void;
}

export interface ButtonFieldWidget extends FieldWidget {
  /** Additional method for button-type fields */
  updateValuesMap(valuesMap: Record<string, FieldValueType>): void;
}

/**
 * Signature of a field factory function stored in the component registry.
 */
export type FieldFactory = (
  field: DefinitionPropertyField,
  ctx: FormContext,
  onChange: (v: FieldValueType) => void,
  onError: (e: string | null) => void,
  initialValue: FieldValueType,
  initialError: string | null,
  disabled: boolean
) => FieldWidget;

/**
 * Extended factory signature for button fields.
 */
export type ButtonFieldFactory = (
  field: DefinitionPropertyField,
  ctx: FormContext,
  valuesMap: Record<string, FieldValueType>,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: string | null) => void
) => ButtonFieldWidget;
