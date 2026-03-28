/**
 * Vanilla JS FieldGroup (collapsible fieldset).
 * Replaces FieldGroup.tsx (React).
 */
import type { DefinitionPropertyField, FieldValueType, ErrorType } from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import { createFieldRenderer, type FieldRendererResult } from './FieldRenderer';

export interface FieldGroupResult {
  el: HTMLElement;
  update(
    valuesMap: Record<string, FieldValueType>,
    errorsMap: Record<string, string>
  ): void;
  updateValuesMap(valuesMap: Record<string, FieldValueType>): void;
  destroy(): void;
}

export function createFieldGroup(
  groupName: string,
  fields: DefinitionPropertyField[],
  valuesMap: Record<string, FieldValueType>,
  ctx: FormContext,
  handleChange: (fieldName: string, value: FieldValueType) => void,
  handleError: (fieldName: string, error: ErrorType) => void,
  errorsMap: Record<string, string>,
  defaultOpen = true
): FieldGroupResult {
  let isOpen = defaultOpen;
  const renderers = new Map<string, FieldRendererResult>();

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'formitiva-group';

  const legend = document.createElement('legend');
  legend.className = 'formitiva-group_legend';

  const nameSpan = document.createElement('span');
  nameSpan.textContent = ctx.t(groupName);
  legend.appendChild(nameSpan);

  const arrowSpan = document.createElement('span');
  arrowSpan.className = 'formitiva-group_legend_arrow';
  arrowSpan.textContent = isOpen ? '\u25BC' : '\u25B6';
  legend.appendChild(arrowSpan);

  legend.addEventListener('click', () => {
    isOpen = !isOpen;
    arrowSpan.textContent = isOpen ? '\u25BC' : '\u25B6';
    fieldsContainer.style.display = isOpen ? '' : 'none';
  });

  fieldset.appendChild(legend);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.style.display = isOpen ? '' : 'none';
  fieldset.appendChild(fieldsContainer);

  // Create initial renderers
  for (const field of fields) {
    const renderer = createFieldRenderer(
      field,
      valuesMap,
      ctx,
      handleChange,
      handleError,
      errorsMap[field.name] ?? null
    );
    if (renderer) {
      renderers.set(field.name, renderer);
      fieldsContainer.appendChild(renderer.el);
    }
  }

  const update = (
    newValuesMap: Record<string, FieldValueType>,
    newErrorsMap: Record<string, string>
  ) => {
    for (const field of fields) {
      const renderer = renderers.get(field.name);
      if (renderer) {
        renderer.update(
          newValuesMap[field.name],
          newErrorsMap[field.name] ?? null,
          Boolean(field.disabled)
        );
      }
    }
  };

  const updateValuesMap = (newValuesMap: Record<string, FieldValueType>) => {
    for (const renderer of renderers.values()) {
      renderer.updateValuesMap?.(newValuesMap);
    }
  };

  const destroy = () => {
    for (const renderer of renderers.values()) {
      renderer.destroy();
    }
    renderers.clear();
  };

  return { el: fieldset, update, updateValuesMap, destroy };
}
