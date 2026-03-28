/**
 * Vanilla JS FieldRenderer.
 * Creates a DOM element for a single form field using the component registry.
 */
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import { getComponent } from '../../core/registries/componentRegistry';
import type { FieldWidget, ButtonFieldFactory } from '../../core/fieldWidget';
import type { FormContext } from '../../context/formitivaContext';

export interface FieldRendererResult {
  el: HTMLElement;
  update(
    value: FieldValueType,
    error: string | null,
    disabled: boolean
  ): void;
  updateValuesMap?(valuesMap: Record<string, FieldValueType>): void;
  destroy(): void;
}

export function createFieldRenderer(
  field: DefinitionPropertyField,
  valuesMap: Record<string, FieldValueType>,
  ctx: FormContext,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: ErrorType) => void,
  initialError: string | null
): FieldRendererResult | null {
  const factory = getComponent(field.type);
  if (!factory) return null;

  const isDisabled = Boolean(field.disabled);

  const wrap = document.createElement('div');
  if (isDisabled) {
    wrap.setAttribute('aria-disabled', 'true');
    wrap.style.opacity = '0.6';
    wrap.style.pointerEvents = 'none';
  }

  let widget: FieldWidget;

  if (field.type === 'button') {
    const buttonFactory = factory as unknown as ButtonFieldFactory;
    const btnWidget = buttonFactory(
      field,
      ctx,
      valuesMap,
      handleChange,
      handleError
    );
    wrap.appendChild(btnWidget.el);
    return {
      el: wrap,
      update(_v, _e, disabled) {
        wrap.setAttribute('aria-disabled', String(disabled));
        wrap.style.opacity = disabled ? '0.6' : '1';
        wrap.style.pointerEvents = disabled ? 'none' : '';
      },
      updateValuesMap(vm) {
        btnWidget.updateValuesMap?.(vm);
      },
      destroy() { btnWidget.destroy(); },
    };
  }

  const initialValue = valuesMap[field.name];
  widget = (factory as unknown as (
    field: DefinitionPropertyField,
    ctx: FormContext,
    onChange: (v: FieldValueType) => void,
    onError: (e: string | null) => void,
    initialValue: FieldValueType,
    initialError: string | null,
    disabled: boolean
  ) => FieldWidget)(
    field,
    ctx,
    (v) => handleChange(field.name, v),
    (e) => handleError(field.name, e),
    initialValue,
    initialError,
    isDisabled
  );

  wrap.appendChild(widget.el);

  return {
    el: wrap,
    update(value, error, disabled) {
      wrap.setAttribute('aria-disabled', String(disabled));
      wrap.style.opacity = disabled ? '0.6' : '1';
      wrap.style.pointerEvents = disabled ? 'none' : '';
      widget.update(value, error, disabled);
    },
    destroy() { widget.destroy(); },
  };
}
