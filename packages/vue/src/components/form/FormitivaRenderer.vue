<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from 'vue';
import type { FormitivaContextType } from '@formitiva/core';
import type {
  FieldValueType,
  ErrorType,
  DefinitionPropertyField,
  FormitivaDefinition,
  FormitivaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';
import useFormitivaContext, { provideFormitivaContext } from '../../hooks/useFormitivaContext';
import FieldRenderer from '../layout/FieldRenderer.vue';
import FieldGroup from '../layout/FieldGroup.vue';
import { InstanceName } from '../layout/LayoutComponents';
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
import SubmissionMessage from './SubmissionMessage.vue';
import SubmissionButton from './SubmissionButton.vue';

export interface FormitivaRendererProps {
  definition: FormitivaDefinition;
  instance: FormitivaInstance;
  onSubmit?: FormSubmissionHandler;
  onValidation?: FormValidationHandler;
}

const props = withDefaults(defineProps<FormitivaRendererProps>(), {
  onSubmit: undefined,
  onValidation: undefined,
});

const { properties, displayName } = props.definition;
const parentContext = useFormitivaContext();

const renderContext = computed(() => ({
  ...parentContext,
  definitionName: props.definition?.name ?? parentContext.definitionName,
}));

// Read t, formStyle, displayInstanceName from renderContext so they stay
// reactive when translation maps reload or theme/style changes
const t = computed(() => renderContext.value.t);
const formStyle = computed(() => renderContext.value.formStyle);
const displayInstanceName = computed(() => renderContext.value.displayInstanceName);

const updatedProperties = ref<DefinitionPropertyField[]>([]);
const fieldMap = ref<Record<string, DefinitionPropertyField>>({});
const valuesMap = ref<Record<string, FieldValueType>>({});
const visibility = ref<Record<string, boolean>>({});
const visibilityRefStatus = ref<Record<string, FieldVisibilityStatus>>({});
const disabledByRef = ref<Record<string, boolean>>({});
const errors = ref<Record<string, string>>({});
const submissionMessage = ref<string | null>(null);
const submissionSuccess = ref<boolean | null>(null);
const instanceName = ref<string>(props.instance.name || '');
const targetInstance = ref<FormitivaInstance>(props.instance);
const suppressClearOnNextInstanceUpdate = ref(false);

// Initialize all state synchronously so fields are visible on first render
const initialize = () => {
  const nameToField = Object.fromEntries(
    properties.map((f) => [
      f.name,
      { ...f, children: {} as Record<string, string[]> },
    ])
  );

  properties.forEach((field) => {
    if (!field.parents) return;
    Object.entries(field.parents).forEach(([parentName, selections]) => {
      const parentField = nameToField[parentName];
      if (!parentField) return;
      selections.forEach((sel) => {
        if (!parentField.children) {
          parentField.children = {};
        }
        const key = String(sel);
        parentField.children[key] = [
          ...(parentField.children[key] || []),
          field.name,
        ];
      });
    });
  });

  renameDuplicatedGroups(properties, nameToField);

  const updatedProps = Object.values(nameToField) as DefinitionPropertyField[];

  // Initialize valuesMapInit with definition default values
  const valuesMapInit = {} as Record<string, FieldValueType>;
  updatedProps.forEach((f) => {
    if (f.type === "unit") {
      const numVal = typeof f.defaultValue === "number" ? String(f.defaultValue) : "";
      const unitVal = typeof f.defaultUnit === "string" ? f.defaultUnit : String(f.defaultUnit ?? "m");
      valuesMapInit[f.name] = [numVal, unitVal] as unknown as FieldValueType;
    } else {
      valuesMapInit[f.name] = f.defaultValue;
    }
  });

  // Use instance to override valuesMapInit
  targetInstance.value = props.instance;
  Object.keys(props.instance.values).forEach((key) => {
    if (nameToField[key] !== undefined) {
      valuesMapInit[key] = props.instance.values[key];
    }
  });

  // Initialize visibility map
  const vis = Object.fromEntries(updatedProps.map((field) => [field.name, false]));

  updatedProperties.value = updatedProps;
  fieldMap.value = nameToField;
  // Apply computed value handlers before setting initial state
  const initComputed = applyComputedRefs(updatedProps, valuesMapInit, t.value);
  Object.assign(valuesMapInit, initComputed);

  valuesMap.value = valuesMapInit;
  visibility.value = updateVisibilityMap(updatedProps, valuesMapInit, vis, nameToField);
  instanceName.value = props.instance.name;

  const refStatus = applyVisibilityRefs(updatedProps, valuesMapInit, t.value);
  visibilityRefStatus.value = refStatus;
  disabledByRef.value = Object.fromEntries(
    Object.entries(refStatus).map(([name, s]) => [name, s === 'disable'])
  );
};

watch([() => properties, () => props.instance, () => props.definition], initialize, { immediate: true });

// Handle field change
const handleChange = (name: string, value: FieldValueType) => {
  const field = fieldMap.value[name];
  if (!field) return;

  // Clear submission message
  submissionMessage.value = null;
  submissionSuccess.value = null;

  // Update values map; merge in any computed values that depend on the changed field
  const baseValues = { ...valuesMap.value, [name]: value };
  const computedVals = applyComputedRefs(updatedProperties.value, baseValues, t.value);
  const newValues = Object.keys(computedVals).length > 0 ? { ...baseValues, ...computedVals } : baseValues;
  valuesMap.value = newValues;

  // Update visibility
  const hasChildren = field && field.children && Object.keys(field.children).length > 0;
  const isParentToOthers = Object.values(fieldMap.value).some(
    (f) => f.parents && name in f.parents
  );

  if (hasChildren || isParentToOthers) {
    visibility.value = updateVisibilityBasedOnSelection(
      visibility.value,
      fieldMap.value,
      newValues,
      name,
      value
    );
  }

  const refStatus = applyVisibilityRefs(updatedProperties.value, newValues, t.value);
  visibilityRefStatus.value = refStatus;
  disabledByRef.value = Object.fromEntries(
    Object.entries(refStatus).map(([n, s]) => [n, s === 'disable'])
  );
};

// When active instance changes
watch(() => props.instance, (newInstance) => {
  if (suppressClearOnNextInstanceUpdate.value) {
    suppressClearOnNextInstanceUpdate.value = false;
    targetInstance.value = newInstance;
    instanceName.value = newInstance.name || "";
    return;
  }

  targetInstance.value = newInstance;
  submissionMessage.value = null;
  submissionSuccess.value = null;
  instanceName.value = newInstance.name || "";
});

// Handle error
const handleError = (name: string, error: ErrorType) => {
  if (fieldMap.value[name]?.disabled) {
    const rest = { ...errors.value } as Record<string, string>;
    delete rest[name];
    errors.value = rest;
    return;
  }

  if (error) {
    errors.value = { ...errors.value, [name]: String(error) };
    } else {
    const rest = { ...errors.value } as Record<string, string>;
    delete rest[name];
    errors.value = rest;
  }
};

// Handle submit
const handleSubmit = async () => {
  suppressClearOnNextInstanceUpdate.value = true;

  const prevName = targetInstance.value?.name;
  targetInstance.value.name = instanceName.value;

  let errorsForSubmit = errors.value;

  // Validate on submission if needed
  if (renderContext.value.fieldValidationMode === "onSubmission") {
    const newErrors: Record<string, string> = {};
    updatedProperties.value.forEach((field) => {
      if (field.disabled) return;
      const value = valuesMap.value[field.name];
      if (value === undefined) return;
      const err = validateField(renderContext.value.definitionName, field, value, t.value);
      if (err) {
        newErrors[field.name] = err;
      }
    });

    errors.value = newErrors;
    errorsForSubmit = newErrors;

    if (Object.keys(newErrors).length > 0) {
      submissionMessage.value = t.value("Please fix validation errors before submitting the form.");
      submissionSuccess.value = false;
      return;
    } else {
      submissionMessage.value = null;
      submissionSuccess.value = null;
    }
  }

  // Submit form
  const result = await submitForm(
    props.definition,
    targetInstance.value,
    valuesMap.value,
    t.value,
    errorsForSubmit,
    props.onSubmit,
    props.onValidation
  );

  const msg = typeof result.message === 'string' ? result.message : String(result.message);
  const errMsg = Object.values(result.errors ?? {}).join("\n");
  if (errMsg) {
    submissionMessage.value = msg + "\n" + errMsg;
  } else {
    submissionMessage.value = msg;
  }
  submissionSuccess.value = result.success;

  if (!result.success) {
    targetInstance.value.name = prevName ?? targetInstance.value.name;
    instanceName.value = prevName ?? "";
  }
};

const isApplyDisabled = computed(() =>
  (
    renderContext.value.fieldValidationMode === "onEdit" ||
    renderContext.value.fieldValidationMode === "onBlur" ||
    renderContext.value.fieldValidationMode === "realTime"
  )
    ? Object.values(errors.value).some(Boolean)
    : false
);

const visibleFields = computed(() =>
  updatedProperties.value.filter((field) => {
    const refStatus = visibilityRefStatus.value[field.name];
    if (refStatus !== undefined) return refStatus !== 'invisible';
    return visibility.value[field.name];
  })
);

const groups = computed(() => {
  const { groups: fieldGroups } = groupConsecutiveFields(visibleFields.value);
  return fieldGroups;
});

// Provide a reactive render context once and keep it in sync with renderContext.
const providedRenderContext = reactive({ ...(renderContext.value as Record<string, unknown>) }) as unknown as FormitivaContextType;
provideFormitivaContext(providedRenderContext);
watchEffect(() => {
  Object.assign(providedRenderContext, renderContext.value as unknown as Record<string, unknown>);
});
</script>

<template>
  <div :style="formStyle.container">
    <h2 v-if="displayName" :style="formStyle.titleStyle">{{ t(displayName) }}</h2>
    
    <SubmissionMessage
      :message="submissionMessage"
      :success="submissionSuccess"
      :t="t"
      @dismiss="() => { submissionMessage = null; submissionSuccess = null; }"
    />
    
    <InstanceName
      v-if="displayInstanceName && instance"
      :name="instanceName"
      @change="(newName: string) => {
        instanceName = newName;
        submissionMessage = null;
        submissionSuccess = null;
      }"
    />

    <template v-for="(group, index) in groups" :key="group.name || `ungrouped-${index}`">
      <FieldGroup
        v-if="group.name"
        :group-name="group.name"
        :default-open="true"
        :fields="group.fields"
        :values-map="valuesMap"
        :errors-map="errors"
        :t="t"
        :handleChange="handleChange"
        :handleError="handleError"
        :disabled-by-ref="disabledByRef"
      />
      <template v-else>
        <FieldRenderer
          v-for="field in group.fields"
          :key="field.name"
          :field="field"
          :values-map="valuesMap"
          :errors-map="errors"
          :handleChange="handleChange"
          :handleError="handleError"
          :disabled-by-ref="disabledByRef"
        />
      </template>
    </template>

    <SubmissionButton 
      :disabled="isApplyDisabled" 
      :t="t"
      @click="handleSubmit" 
    />
  </div>
</template>
