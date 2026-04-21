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
import { getLayoutAdapter, type VanillaLayoutAdapterResult } from '../../core/registries/layoutAdapterRegistry';
import {
  initFormState,
  computeFieldChange,
  computeVisibleGroups,
  computeSubmitErrors,
  isSubmitDisabled,
  getLayout,
} from '@formitiva/core';
import type { FieldVisibilityStatus } from '@formitiva/core';
import { submitForm } from '@formitiva/core';
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
  const { displayName } = definition;
  const { t, formStyle } = ctx;

  // ── Init all form state via shared core utility ──────────────────────────
  const init = initFormState(definition, instance, t);
  const { nameToField, updatedProperties } = init;
  const valuesMap: Record<string, FieldValueType> = init.valuesMap;
  const vis: Record<string, boolean> = init.visibility;
  const visRefStatus: Record<string, FieldVisibilityStatus> = init.visibilityRefStatus;

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

  // Submit button — created here; placed into the layout's submitSlot when a
  // wizard layout is active, otherwise appended directly to the outer container.
  const submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = CSS_CLASSES.button;
  submitBtn.textContent = t('Submit');
  Object.assign(submitBtn.style, { width: '120px' });

  // Layout adapter
  const activeLayout = getLayout(definition?.layoutRef ?? '');
  const layoutAdapter = getLayoutAdapter();
  let activeSection: string = activeLayout?.defaultValue ?? '';
  let layoutAdapterResult: VanillaLayoutAdapterResult | null = null;

  // When a layout is active, we mount a layout widget and route field rendering
  // into its contentEl instead of directly into fieldsContainer.
  let fieldsMountEl: HTMLElement = fieldsContainer;

  const onSectionChange = (name: string) => {
    activeSection = name;
    reconcileFields();
  };

  if (activeLayout && layoutAdapter) {
    layoutAdapterResult = layoutAdapter(activeLayout, activeSection, onSectionChange, t);
    fieldsContainer.appendChild(layoutAdapterResult.el);
    fieldsMountEl = layoutAdapterResult.contentEl;
    // If the layout provides a submit slot (e.g. wizard nav row), inject the button there.
    if (layoutAdapterResult.submitSlot) {
      layoutAdapterResult.submitSlot.appendChild(submitBtn);
    } else {
      container.appendChild(submitBtn);
    }
  } else {
    container.appendChild(submitBtn);
  }

  // Track active entries in DOM order
  const activeEntries: GroupEntry[] = [];

  function handleChange(name: string, value: FieldValueType) {
    const field = nameToField[name];
    if (!field) return;
    submMsg.update(null, null);

    const changed = computeFieldChange(name, value, {
      fieldMap: nameToField,
      updatedProperties,
      valuesMap: { ...valuesMap },
      visibility: { ...vis },
    }, t);

    Object.assign(valuesMap, changed.newValues);
    Object.assign(vis, changed.newVisibility);
    Object.assign(visRefStatus, changed.newVisRefStatus);

    // Update DOM widgets for computed-value fields that changed
    Object.keys(changed.newValues).forEach(cName => {
      if (cName === name) return;
      const cEntry = activeEntries.find(e => e.type === 'field' && e.name === cName);
      if (cEntry && cEntry.type === 'field') {
        (cEntry.result as FieldRendererResult).update(
          changed.newValues[cName],
          errorsMap[cName] ?? null,
          Boolean(nameToField[cName]?.disabled),
        );
      }
    });

    // Always update the DOM widget for the changed field so button handlers
    // that externally set a field's value are reflected immediately.
    const changedEntry = activeEntries.find(e => e.type === 'field' && e.name === name);
    if (changedEntry && changedEntry.type === 'field') {
      (changedEntry.result as FieldRendererResult).update(value, errorsMap[name] ?? null, Boolean(field.disabled));
    }

    if (changed.visibilityChanged || changed.newVisibility !== vis) {
      reconcileFields();
    }
    // Update button valuesMap
    activeEntries.forEach(e => {
      if (e.type === 'group') e.result.updateValuesMap(valuesMap);
      else if (e.result.updateValuesMap) e.result.updateValuesMap(valuesMap);
    });
    updateSubmitBtn();
    updateNextBtn();
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
    updateNextBtn();
  }

  function hasErrorsInFields(fieldNames?: string[] | null): boolean {
    if (!fieldNames?.length) {
      return false;
    }

    const fields = updatedProperties.filter((field) => fieldNames.includes(field.name));
    return Object.keys(computeSubmitErrors(fields, valuesMap, ctx.definitionName, t)).length > 0;
  }

  function updateSubmitBtn() {
    if (activeLayout) {
      submitBtn.disabled = Object.keys(
        computeSubmitErrors(updatedProperties, valuesMap, ctx.definitionName, t),
      ).length > 0;
      return;
    }

    submitBtn.disabled = isSubmitDisabled(ctx.fieldValidationMode, errorsMap);
  }

  function updateNextBtn() {
    if (activeLayout?.type !== 'wizard' || !layoutAdapterResult?.setNextDisabled) {
      return;
    }

    const sectionProps = activeLayout.sections.find((section) => section.name === activeSection)?.props ?? [];
    layoutAdapterResult.setNextDisabled(hasErrorsInFields(sectionProps));
  }

  function reconcileFields() {
    const groups = computeVisibleGroups(updatedProperties, vis, visRefStatus);

    // When a layout is active, only show props belonging to the current section.
    const sectionProps = activeLayout
      ? new Set(activeLayout.sections.find(s => s.name === activeSection)?.props ?? [])
      : null;

    // Build wanted list: { key, type, fields? }
    const wanted: Array<{ key: string; type: 'group' | 'field'; groupName?: string; fields?: DefinitionPropertyField[]; field?: DefinitionPropertyField }> = [];
    groups.forEach((group) => {
      if (group.name) {
        // Filter group fields to those in the active section (if a layout is active)
        const fields = sectionProps
          ? group.fields.filter(f => sectionProps.has(f.name))
          : group.fields;
        if (fields.length > 0) {
          wanted.push({ key: `group:${group.name}`, type: 'group', groupName: group.name, fields });
        }
      } else {
        group.fields.forEach(f => {
          if (!sectionProps || sectionProps.has(f.name)) {
            wanted.push({ key: `field:${f.name}`, type: 'field', field: f });
          }
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

      // Ensure correct DOM order within the current mount element
      const refEl = fieldsMountEl.children[idx] as HTMLElement | undefined;
      if (refEl !== entry.el) {
        if (refEl) fieldsMountEl.insertBefore(entry.el, refEl);
        else fieldsMountEl.appendChild(entry.el);
      }
    });

    activeEntries.length = 0;
    newOrder.forEach(e => activeEntries.push(e));

    updateSubmitBtn();
    updateNextBtn();
  }

  // Initial render
  reconcileFields();

  // Submit handler
  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submMsg.update(null, null);
    instance.name = instanceName;

    let errorsForSubmit = { ...errorsMap };

    if (ctx.fieldValidationMode === 'onSubmission') {
      const newErrors = computeSubmitErrors(updatedProperties, valuesMap, ctx.definitionName, t);
      // Sync errorsMap in-place
      Object.keys(errorsMap).forEach(k => { delete errorsMap[k]; });
      Object.assign(errorsMap, newErrors);
      errorsForSubmit = newErrors;
      reconcileFields();
      if (Object.keys(newErrors).length > 0) {
        const msg = t('Please fix validation errors before submitting the form.');
        submissionMessage = msg; submissionSuccess = false;
        submMsg.update(msg, false);
        updateSubmitBtn();
        updateNextBtn();
        return;
      }
    }

    const result = await submitForm(definition, instance, valuesMap, t, errorsForSubmit, onSubmit, onValidation);
    const msg = typeof result.message === 'string' ? result.message : String(result.message);
    const errMsg = Object.values(result.errors ?? {}).join('\n');
    submissionMessage = errMsg ? `${msg}\n${errMsg}` : msg;
    submissionSuccess = result.success;
    submMsg.update(submissionMessage, submissionSuccess);
    updateSubmitBtn();
    updateNextBtn();
    if (!result.success) instance.name = instanceName;
  });

  return {
    el: container,
    getValues() { return { ...valuesMap }; },
    validate() {
      const newErrors = computeSubmitErrors(
        updatedProperties.filter(f => vis[f.name]),
        valuesMap,
        ctx.definitionName,
        t,
      );
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
