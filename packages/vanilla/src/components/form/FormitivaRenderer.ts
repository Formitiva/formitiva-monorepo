/**
 * Vanilla JS FormitivaRenderer.
 * Replaces FormitivaProvider + FormitivaRenderer React components.
 */
import type {
  FieldValueType,
  ErrorType,
  DefinitionPropertyField,
  FormitivaDefinition,
  FormitivaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import { createFieldRenderer, type FieldRendererResult } from '../layout/FieldRenderer';
import { createFieldGroup, type FieldGroupResult } from '../layout/FieldGroup';
import {
  updateVisibilityMap,
  updateVisibilityBasedOnSelection,
  applyVisibilityRefs,
  applyComputedRefs,
} from '@formitiva/core';
import type { FieldVisibilityStatus } from '@formitiva/core';
import { renameDuplicatedGroups, groupConsecutiveFields } from '@formitiva/core';
import { submitForm } from '@formitiva/core';
import { validateField } from '@formitiva/core';
import { createSubmissionMessage } from './SubmissionMessage';
import { CSS_CLASSES } from '@formitiva/core';

export interface FormitivaRendererOptions {
  definition: FormitivaDefinition;
  instance: FormitivaInstance;
  ctx: FormContext;
  onSubmit?: FormSubmissionHandler;
  onValidation?: FormValidationHandler;
}

export interface FormitivaRendererResult {
  el: HTMLElement;
  getValues(): Record<string, FieldValueType>;
  validate(): boolean;
  destroy(): void;
}

type GroupEntry = {
  type: 'group';
  name: string;
  result: FieldGroupResult;
  el: HTMLElement;
} | {
  type: 'field';
  name: string;
  result: FieldRendererResult;
  el: HTMLElement;
};

export function createFormitivaRenderer(opts: FormitivaRendererOptions): FormitivaRendererResult {
  const { definition, ctx, onSubmit, onValidation } = opts;
  let instance = opts.instance;
  const { properties, displayName } = definition;
  const { t, formStyle } = ctx;

  // Build fieldMap with children populated
  const nameToField: Record<string, DefinitionPropertyField> = {};
  properties.forEach(f => { nameToField[f.name] = { ...f, children: {} as Record<string, string[]> }; });
  properties.forEach(field => {
    if (!field.parents) return;
    Object.entries(field.parents).forEach(([parentName, selections]) => {
      const parentField = nameToField[parentName];
      if (!parentField) return;
      selections.forEach(sel => {
        if (!parentField.children) parentField.children = {};
        const key = String(sel);
        parentField.children[key] = [...(parentField.children[key] || []), field.name];
      });
    });
  });
  renameDuplicatedGroups(properties, nameToField);
  const updatedProperties = Object.values(nameToField) as DefinitionPropertyField[];

  // Initialize valuesMap
  const valuesMap: Record<string, FieldValueType> = {};
  updatedProperties.forEach(f => {
    if (f.type === 'unit') {
      const numVal = typeof f.defaultValue === 'number' ? String(f.defaultValue) : '';
      const unitVal = typeof f.defaultUnit === 'string' ? f.defaultUnit : String(f.defaultUnit ?? 'm');
      valuesMap[f.name] = [numVal, unitVal] as unknown as FieldValueType;
    } else {
      valuesMap[f.name] = f.defaultValue;
    }
  });
  Object.keys(instance.values).forEach(key => {
    if (nameToField[key] !== undefined) valuesMap[key] = instance.values[key];
  });

  // Apply computed value handlers before setting initial state
  const initComputed = applyComputedRefs(updatedProperties, valuesMap, t);
  Object.assign(valuesMap, initComputed);

  // Visibility
  const vis: Record<string, boolean> = {};
  updatedProperties.forEach(f => { vis[f.name] = false; });
  Object.assign(vis, updateVisibilityMap(updatedProperties, valuesMap, vis, nameToField));

  // VisibilityRef handler results
  const visRefStatus: Record<string, FieldVisibilityStatus> = {};
  Object.assign(visRefStatus, applyVisibilityRefs(updatedProperties, valuesMap, t));

  const errorsMap: Record<string, string> = {};
  let submissionMessage: string | null = null;
  let submissionSuccess: boolean | null = null;
  let instanceName = instance.name || '';

  // DOM structure
  const container = document.createElement('div');
  Object.assign(container.style, formStyle.container);

  if (displayName) {
    const h2 = document.createElement('h2');
    Object.assign(h2.style, formStyle.titleStyle);
    h2.textContent = t(displayName);
    container.appendChild(h2);
  }

  const submMsg = createSubmissionMessage(t, () => {
    submissionMessage = null; submissionSuccess = null;
  });
  container.appendChild(submMsg.el);

  // Instance name row
  let instanceNameInput: HTMLInputElement | null = null;
  if (ctx.displayInstanceName && instance) {
    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' });
    const lbl = document.createElement('label');
    lbl.htmlFor = '__instance_name__';
    lbl.textContent = t('Name:');
    Object.assign(lbl.style, { fontWeight: '500', flexShrink: '0' });
    instanceNameInput = document.createElement('input');
    instanceNameInput.type = 'text';
    instanceNameInput.id = '__instance_name__';
    instanceNameInput.value = instanceName;
    instanceNameInput.className = CSS_CLASSES.input;
    Object.assign(instanceNameInput.style, { flex: '1' });
    instanceNameInput.addEventListener('input', () => {
      instanceName = instanceNameInput!.value;
      submMsg.update(null, null);
    });
    row.appendChild(lbl);
    row.appendChild(instanceNameInput);
    container.appendChild(row);
  }

  const fieldsContainer = document.createElement('div');
  container.appendChild(fieldsContainer);

  // Submit button
  const isApplyDisabledMode = ctx.fieldValidationMode === 'onEdit' || ctx.fieldValidationMode === 'onBlur' || ctx.fieldValidationMode === 'realTime';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = CSS_CLASSES.button;
  submitBtn.textContent = t('Submit');
  Object.assign(submitBtn.style, { width: '120px' });
  container.appendChild(submitBtn);

  // Track active entries in DOM order
  const activeEntries: GroupEntry[] = [];

  function handleChange(name: string, value: FieldValueType) {
    const field = nameToField[name];
    if (!field) return;
    valuesMap[name] = value;
    submMsg.update(null, null);

    // Apply computed value handlers and update affected widgets
    const computedVals = applyComputedRefs(updatedProperties, valuesMap, t);
    const computedChanged = Object.keys(computedVals).length > 0 &&
      Object.entries(computedVals).some(([k, v]) => valuesMap[k] !== v);
    if (computedChanged) {
      Object.assign(valuesMap, computedVals);
      Object.entries(computedVals).forEach(([cName, cVal]) => {
        const cEntry = activeEntries.find(e => e.type === 'field' && e.name === cName);
        if (cEntry && cEntry.type === 'field') {
          (cEntry.result as FieldRendererResult).update(
            cVal,
            errorsMap[cName] ?? null,
            Boolean(nameToField[cName]?.disabled),
          );
        }
      });
    }

    // Always update the DOM widget for the changed field so button handlers
    // that externally set a field's value are reflected immediately.
    const changedEntry = activeEntries.find(e => e.type === 'field' && e.name === name);
    if (changedEntry && changedEntry.type === 'field') {
      (changedEntry.result as FieldRendererResult).update(value, errorsMap[name] ?? null, Boolean(field.disabled));
    }

    const hasChildren = field.children && Object.keys(field.children).length > 0;
    const isParentToOthers = Object.values(nameToField).some(f => f.parents && name in f.parents);
    if (hasChildren || isParentToOthers) {
      const newVis = updateVisibilityBasedOnSelection({ ...vis }, nameToField, valuesMap, name, value);
      Object.assign(vis, newVis);
    }

    // Update visibilityRef handler results
    const newVisRefStatus = applyVisibilityRefs(updatedProperties, valuesMap, t);
    const visRefChanged = Object.entries(newVisRefStatus).some(([k, v]) => visRefStatus[k] !== v);
    Object.assign(visRefStatus, newVisRefStatus);

    if (hasChildren || isParentToOthers || visRefChanged) {
      reconcileFields();
    }
    // Update button valuesMap
    activeEntries.forEach(e => {
      if (e.type === 'group') e.result.updateValuesMap(valuesMap);
      else if (e.result.updateValuesMap) e.result.updateValuesMap(valuesMap);
    });
    updateSubmitBtn();
  }

  function handleError(name: string, error: ErrorType) {
    if (nameToField[name]?.disabled) {
      delete errorsMap[name];
    } else if (error) {
      errorsMap[name] = String(error);
    } else {
      delete errorsMap[name];
    }
    updateSubmitBtn();
  }

  function updateSubmitBtn() {
    if (isApplyDisabledMode) {
      submitBtn.disabled = Object.values(errorsMap).some(Boolean);
    }
  }

  function reconcileFields() {
    const visibleFields = updatedProperties.filter(f => {
      const refStatus = visRefStatus[f.name];
      if (refStatus !== undefined) return refStatus !== 'invisible';
      return vis[f.name];
    });
    const { groups } = groupConsecutiveFields(visibleFields);

    // Build wanted list: { key, type, fields? }
    const wanted: Array<{ key: string; type: 'group' | 'field'; groupName?: string; fields?: DefinitionPropertyField[]; field?: DefinitionPropertyField }> = [];
    groups.forEach((group) => {
      if (group.name) {
        wanted.push({ key: `group:${group.name}`, type: 'group', groupName: group.name, fields: group.fields });
      } else {
        group.fields.forEach(f => {
          wanted.push({ key: `field:${f.name}`, type: 'field', field: f });
        });
      }
    });

    const wantedKeys = new Set(wanted.map(w => w.key));

    // Remove no-longer-visible
    for (let i = activeEntries.length - 1; i >= 0; i--) {
      const e = activeEntries[i];
      const key = e.type === 'group' ? `group:${e.name}` : `field:${e.name}`;
      if (!wantedKeys.has(key)) {
        e.el.remove();
        e.result.destroy();
        activeEntries.splice(i, 1);
      }
    }

    // Build lookup
    const existing = new Map<string, GroupEntry>();
    activeEntries.forEach(e => {
      const key = e.type === 'group' ? `group:${e.name}` : `field:${e.name}`;
      existing.set(key, e);
    });

    // Insert / reorder
    const newOrder: GroupEntry[] = [];
    wanted.forEach((w, idx) => {
      let entry = existing.get(w.key);
      if (!entry) {
        if (w.type === 'group') {
          const result = createFieldGroup(w.groupName!, w.fields!, valuesMap, ctx, handleChange, handleError, errorsMap);
          entry = { type: 'group', name: w.groupName!, result, el: result.el };
        } else {
          const f = w.field!;
          const result = createFieldRenderer(f, valuesMap, ctx, handleChange, handleError, errorsMap[f.name] ?? null);
          if (!result) return;
          entry = { type: 'field', name: f.name, result, el: result.el };
        }
      } else {
        if (w.type === 'group') {
          (entry.result as FieldGroupResult).update(valuesMap, errorsMap);
        } else {
          const f = w.field!;
          (entry.result as FieldRendererResult).update(valuesMap[f.name], errorsMap[f.name] ?? null, Boolean(f.disabled) || visRefStatus[f.name] === 'disable');
        }
      }
      newOrder.push(entry);

      // Ensure correct DOM order
      const refEl = fieldsContainer.children[idx] as HTMLElement | undefined;
      if (refEl !== entry.el) {
        if (refEl) fieldsContainer.insertBefore(entry.el, refEl);
        else fieldsContainer.appendChild(entry.el);
      }
    });

    activeEntries.length = 0;
    newOrder.forEach(e => activeEntries.push(e));
  }

  // Initial render
  reconcileFields();
  updateSubmitBtn();

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submMsg.update(null, null);
    instance.name = instanceName;

    let errorsForSubmit = { ...errorsMap };

    if (ctx.fieldValidationMode === 'onSubmission') {
      const newErrors: Record<string, string> = {};
      updatedProperties.forEach(f => {
        if (f.disabled) return;
        const value = valuesMap[f.name];
        if (value === undefined) return;
        const err = validateField(ctx.definitionName, f, value, t);
        if (err) newErrors[f.name] = err;
      });
      Object.assign(errorsMap, newErrors);
      // Clear old keys not in newErrors
      Object.keys(errorsMap).forEach(k => { if (!newErrors[k]) delete errorsMap[k]; });
      Object.assign(errorsMap, newErrors);
      errorsForSubmit = newErrors;
      reconcileFields();
      if (Object.keys(newErrors).length > 0) {
        const msg = t('Please fix validation errors before submitting the form.');
        submissionMessage = msg; submissionSuccess = false;
        submMsg.update(msg, false);
        submitBtn.disabled = false;
        return;
      }
    }

    const result = await submitForm(definition, instance, valuesMap, t, errorsForSubmit, onSubmit, onValidation);
    const msg = typeof result.message === 'string' ? result.message : String(result.message);
    const errMsg = Object.values(result.errors ?? {}).join('\n');
    submissionMessage = errMsg ? `${msg}\n${errMsg}` : msg;
    submissionSuccess = result.success;
    submMsg.update(submissionMessage, submissionSuccess);
    submitBtn.disabled = !result.success && isApplyDisabledMode ? Object.values(errorsMap).some(Boolean) : false;
    if (!result.success) instance.name = instanceName;
  });

  return {
    el: container,
    getValues() { return { ...valuesMap }; },
    validate() {
      const newErrors: Record<string, string> = {};
      updatedProperties.forEach(f => {
        if (f.disabled || !vis[f.name]) return;
        const err = validateField(ctx.definitionName, f, valuesMap[f.name], t);
        if (err) newErrors[f.name] = err;
      });
      Object.keys(errorsMap).forEach(k => delete errorsMap[k]);
      Object.assign(errorsMap, newErrors);
      reconcileFields();
      return Object.keys(newErrors).length === 0;
    },
    destroy() {
      activeEntries.forEach(e => e.result.destroy());
      activeEntries.length = 0;
      submMsg.destroy();
    },
  };
}
