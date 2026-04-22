<script setup lang="ts">
import { ref, computed, watch, watchEffect, reactive } from 'vue';
import type { DefinitionPropertyField, FormitivaContextType } from '@formitiva/core';
import type {
  FieldValueType,
  ErrorType,
  FormitivaDefinition,
  FormitivaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';
import { getLayout } from '@formitiva/core';
import useFormitivaContext, { provideFormitivaContext } from '../../hooks/useFormitivaContext';
import FieldRenderer from '../layout/FieldRenderer.vue';
import FieldGroup from '../layout/FieldGroup.vue';
import { InstanceName } from '../layout/LayoutComponents';
import { getLayoutAdapter } from '../../core/registries/layoutAdapterRegistry';
import {
  initFormState,
  computeFieldChange,
  computeVisibleGroups,
  computeSubmitErrors,
  isSubmitDisabled,
} from '@formitiva/core';
import type { FieldVisibilityStatus } from '@formitiva/core';
import { submitForm } from '@formitiva/core';
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

// Layout adapter
const activeLayout = getLayout(props.definition?.layoutRef ?? '');
const layoutAdapter = getLayoutAdapter();
const activeSection = ref<string>(activeLayout?.defaultValue ?? '');

// Reset section when layout changes
watch(() => activeLayout?.defaultValue, (val) => {
  activeSection.value = val ?? '';
}, { immediate: true });

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
  const init = initFormState(props.definition, props.instance, t.value);
  targetInstance.value = props.instance;
  updatedProperties.value = init.updatedProperties;
  fieldMap.value = init.nameToField;
  valuesMap.value = init.valuesMap;
  visibility.value = init.visibility;
  visibilityRefStatus.value = init.visibilityRefStatus;
  disabledByRef.value = init.disabledByRef;
  instanceName.value = props.instance.name;
};

watch([() => properties, () => props.instance, () => props.definition], initialize, { immediate: true });

// Handle field change
const handleChange = (name: string, value: FieldValueType) => {
  const field = fieldMap.value[name];
  if (!field) return;

  submissionMessage.value = null;
  submissionSuccess.value = null;

  const changed = computeFieldChange(name, value, {
    fieldMap: fieldMap.value,
    updatedProperties: updatedProperties.value,
    valuesMap: valuesMap.value,
    visibility: visibility.value,
  }, t.value);

  valuesMap.value = changed.newValues;
  visibility.value = changed.newVisibility;
  visibilityRefStatus.value = changed.newVisRefStatus;
  disabledByRef.value = changed.newDisabledByRef;
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

  if (renderContext.value.fieldValidationMode === "onSubmission") {
    const newErrors = computeSubmitErrors(
      updatedProperties.value,
      valuesMap.value,
      renderContext.value.definitionName,
      t.value,
    );
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

  try {
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
    submissionMessage.value = errMsg ? msg + "\n" + errMsg : msg;
    submissionSuccess.value = result.success;

    if (!result.success) {
      targetInstance.value.name = prevName ?? targetInstance.value.name;
      instanceName.value = prevName ?? "";
    }
  } catch (err) {
    console.error('[Formitiva] Form submission threw an unexpected error:', err);
    submissionMessage.value = t.value('An unexpected error occurred. Please try again.');
    submissionSuccess.value = false;
    targetInstance.value.name = prevName ?? targetInstance.value.name;
    instanceName.value = prevName ?? "";
  }
};

const hasErrorsInFields = (fieldNames?: string[] | null) => {
  if (!fieldNames?.length) {
    return false;
  }

  const fields = updatedProperties.value.filter((field) => fieldNames.includes(field.name));
  return Object.keys(
    computeSubmitErrors(
      fields,
      valuesMap.value,
      renderContext.value.definitionName,
      t.value,
    ),
  ).length > 0;
};

const isApplyDisabled = computed(() =>
  activeLayout
    ? Object.keys(
        computeSubmitErrors(
          updatedProperties.value,
          valuesMap.value,
          renderContext.value.definitionName,
          t.value,
        ),
      ).length > 0
    : isSubmitDisabled(renderContext.value.fieldValidationMode, errors.value)
);

// Compute which field names belong to the active layout section
const activeSectionProps = computed<string[] | null>(() => {
  if (!activeLayout) return null;
  return activeLayout.sections.find((n) => n.name === activeSection.value)?.props ?? null;
});

const isNextDisabled = computed(() => hasErrorsInFields(activeSectionProps.value));

// Filter updatedProperties to only the current section's fields
const sectionProperties = computed<DefinitionPropertyField[]>(() => {
  const propsFilter = activeSectionProps.value;
  if (!propsFilter) return updatedProperties.value;
  return updatedProperties.value.filter((p) => propsFilter.includes(p.name));
});

const groups = computed(() =>
  computeVisibleGroups(sectionProperties.value, visibility.value, visibilityRefStatus.value)
);

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

    <!-- Layout adapter (pro plugin) -->
    <component
      v-if="layoutAdapter && activeLayout"
      :is="layoutAdapter"
      :layout="activeLayout"
      :next-disabled="isNextDisabled"
      :model-value="activeSection"
      @update:model-value="(name: string) => { activeSection = name; }"
    >
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
      <template #submit>
        <SubmissionButton :disabled="isApplyDisabled" :t="t" @click="handleSubmit" />
      </template>
    </component>

    <!-- Normal layout (no adapter) -->
    <template v-else>
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
    </template>

    <!-- Submit button: only rendered when no layout adapter is active -->
    <SubmissionButton
      v-if="!layoutAdapter || !activeLayout"
      :disabled="isApplyDisabled" 
      :t="t"
      @click="handleSubmit" 
    />
  </div>
</template>
