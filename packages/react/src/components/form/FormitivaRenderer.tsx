import * as React from "react";
import type {
  FieldValueType,
  ErrorType,
  DefinitionPropertyField,
  FormitivaDefinition,
  FormitivaInstance,
  FormSubmissionHandler,
  FormValidationHandler,
} from '@formitiva/core';
import { getLayout } from '@formitiva/core';
import useFormitivaContext, { FormitivaContext } from "../../hooks/useFormitivaContext";
import { FieldRenderer } from "../layout/FieldRenderer";
import { FieldGroup } from "../layout/FieldGroup";
import { InstanceName } from "../layout/LayoutComponents";
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
import { SubmissionMessage } from "./SubmissionMessage";

export interface FormitivaRendererHandle {
  /** Re-initialize the form to its original state from the current instance. */
  reset: () => void;
  /** Programmatically trigger form submission. */
  submit: () => void;
  /** Return the current field values map. */
  getValues: () => Record<string, FieldValueType>;
  /** Merge a partial values map into the current form state. */
  setValues: (values: Record<string, FieldValueType>) => void;
}

export interface FormitivaRendererProps {
  definition: FormitivaDefinition;
  instance: FormitivaInstance;
  onSubmit?: FormSubmissionHandler;
  onValidation?: FormValidationHandler;
  chunkSize?: number;
  chunkDelay?: number;
}

/**
 * FormitivaRenderer component - Internal form renderer with field management
 * @param {FormitivaRendererProps} props - The component props
 * @param {FormitivaDefinition} props.definition - The form definition object
 * @param {FormitivaInstance} props.instance - The form instance with values
 * @param {number} [props.chunkSize=50] - Number of fields to render per chunk for performance
 * @param {number} [props.chunkDelay=50] - Delay in ms between rendering chunks
 */
const FormitivaRenderer = React.forwardRef<FormitivaRendererHandle, FormitivaRendererProps>(function FormitivaRenderer({
  definition,
  instance,
  onSubmit = undefined,
  onValidation = undefined,
  chunkSize = 50,
  chunkDelay = 50,
}, ref) {
  const { properties, displayName } = definition;
  const parentContext = useFormitivaContext();
  const { t, formStyle, language, displayInstanceName } = parentContext;
  const renderContext = React.useMemo(() => ({
    ...parentContext,
    definitionName: definition?.name ?? parentContext.definitionName,
  }), [parentContext, definition?.name]);
  // Track the previous language in a ref to avoid an extra render cycle on
  // language change (using state would trigger an additional re-render).
  const savedLanguageRef = React.useRef(language ?? "en");

  // Layout adapter registry
  const activeLayout = getLayout(definition?.layoutRef ?? '');
  const LayoutAdapter = getLayoutAdapter();

  // Core state
  const [updatedProperties, setUpdatedProperties] = React.useState<
    DefinitionPropertyField[]
  >([]);
  const [fieldMap, setFieldMap] = React.useState<
    Record<string, DefinitionPropertyField>
  >({});
  const [computedRefFields, setComputedRefFields] = React.useState<DefinitionPropertyField[]>([]);
  const [visibilityRefFields, setVisibilityRefFields] = React.useState<DefinitionPropertyField[]>([]);
  const [valuesMap, setValuesMap] = React.useState<Record<string, FieldValueType>>(
    {}
  );
  const [visibility, setVisibility] = React.useState<Record<string, boolean>>({});
  const [visibilityRefStatus, setVisibilityRefStatus] = React.useState<Record<string, FieldVisibilityStatus>>({});
  const [disabledByRef, setDisabledByRef] = React.useState<Record<string, boolean>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submissionMessage, setSubmissionMessage] = React.useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = React.useState<boolean | null>(null);

  const [loadedCount, setLoadedCount] = React.useState(0); // how many fields are loaded so far
  const [initDone, setInitDone] = React.useState(false);
  
  const [instanceName, setInstanceName] = React.useState<string>(instance.name || '');
  const targetInstanceRef = React.useRef<FormitivaInstance>(instance);
  const suppressClearOnNextInstanceUpdate = React.useRef(false);
  const valuesMapRef = React.useRef(valuesMap);
  React.useEffect(() => { valuesMapRef.current = valuesMap; }, [valuesMap]);

 
  // Step 1: Initialize basic structures immediately
  React.useEffect(() => {
    const init = initFormState(definition, instance, t);
    const raf = requestAnimationFrame(() => {
      // Reset progressive-loading counters so the new form starts from scratch
      setLoadedCount(0);
      setInitDone(false);
      setUpdatedProperties(init.updatedProperties);
      setFieldMap(init.nameToField);
      setComputedRefFields(init.computedRefFields);
      setVisibilityRefFields(init.visibilityRefFields);
      setValuesMap(init.valuesMap);
      setVisibility(init.visibility);
      setVisibilityRefStatus(init.visibilityRefStatus);
      setDisabledByRef(init.disabledByRef);
      setInitDone(true);
      setInstanceName(instance.name);
    });
    return () => cancelAnimationFrame(raf);
  }, [properties, instance, definition]);

  // Step 2: Load fields progressively
  React.useEffect(() => {
    if (!initDone || loadedCount >= updatedProperties.length) return;
    const timer = setTimeout(() => {
      setLoadedCount((prev) =>
        Math.min(prev + chunkSize, updatedProperties.length)
      );
    }, chunkDelay);
    return () => clearTimeout(timer);
  }, [initDone, loadedCount, updatedProperties.length, chunkSize, chunkDelay]);

  // Keep a ref to the latest visibility map so handleChange doesn't need
  // visibility in its dependency array (avoiding cascading re-renders).
  const visibilityRef = React.useRef(visibility);
  React.useEffect(() => { visibilityRef.current = visibility; }, [visibility]);

  /*
   * handleChange
   * ----------------
   * This is the central field change handler passed down to rendered field
   * components. Contract:
   * - name: the field name being changed
   * - value: the new value for the field (may be any FieldValueType)
   * - error: optional validation error string
   *
   * Responsibilities:
   * 1. Update the local values map (using a functional update so we always
   *    operate on the latest state and avoid stale closures).
   * 2. Update the visibility map when the changed field affects conditional
   *    visibility (options/select/radio/multi-select/boolean). Visibility is
   *    recomputed from the new values so dependent fields show/hide correctly.
   */
  const handleChange = React.useCallback(
    (name: string, value: FieldValueType) => {
      const field = fieldMap[name];
      if (!field) return;

      setSubmissionMessage(null);
      setSubmissionSuccess(null);

      setValuesMap((prevValues) => {
        const changed = computeFieldChange(name, value, {
          fieldMap,
          updatedProperties,
          valuesMap: prevValues,
          visibility: visibilityRef.current,
          computedRefFields,
          visibilityRefFields,
        }, t);
        if (changed.newVisibility !== visibilityRef.current) {
          setVisibility(changed.newVisibility);
        }
        setVisibilityRefStatus(changed.newVisRefStatus);
        setDisabledByRef(changed.newDisabledByRef);
        return changed.newValues;
      });
    },
    [fieldMap, updatedProperties, computedRefFields, visibilityRefFields, t]
  );

  // Sync language changes: update savedLanguageRef and clear messages
  React.useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      if (language !== savedLanguageRef.current) {
        savedLanguageRef.current = language ?? "en";
        setSubmissionMessage(null);
        setSubmissionSuccess(null);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [language]);

  // When the active instance changes (selection switched), clear submission messages
  // and sync the editable instance name and ref. Use RAF to avoid cascading renders.
  React.useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      // If this instance update was caused by our own successful submit,
      // skip clearing the submission message but still sync the editable name.
      if (suppressClearOnNextInstanceUpdate.current) {
        suppressClearOnNextInstanceUpdate.current = false;
        // Keep ref in sync with latest instance object
        targetInstanceRef.current = instance;
        setInstanceName(instance.name || "");
        return;
      }

      // Keep ref in sync with latest instance object
      targetInstanceRef.current = instance;
      setSubmissionMessage(null);
      setSubmissionSuccess(null);
      setInstanceName(instance.name || "");
    });
    return () => cancelAnimationFrame(raf);
  }, [instance, instance.name]);

  // handleError: used by input components to report validation-only updates
  // that originate from prop sync (not user events). This keeps the error
  // map up to date when components validate on mount or when external props
  // change without invoking the full handleChange lifecycle.
  const handleError = React.useCallback((name: string, error: ErrorType) => {
    if (fieldMap[name]?.disabled) {
      setErrors((prev) => {
        if (!(name in prev)) return prev;
        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
      return;
    }

    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: String(error) };
      }
      // remove key
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  }, [fieldMap]);

  const handleSubmit = React.useCallback(async () => {
    suppressClearOnNextInstanceUpdate.current = true;
    const prevName = targetInstanceRef.current?.name;
    // Snapshot the intended name before mutating
    const nextName = instanceName;
    targetInstanceRef.current.name = nextName;

    let errorsForSubmit = errors;

    if (renderContext.fieldValidationMode === "onSubmission") {
      const newErrors = computeSubmitErrors(updatedProperties, valuesMap, renderContext.definitionName, t);
      setErrors(newErrors);
      errorsForSubmit = newErrors;

      if (Object.keys(newErrors).length > 0) {
        setSubmissionMessage(t("Please fix validation errors before submitting the form."));
        setSubmissionSuccess(false);
        return;
      } else {
        setSubmissionMessage(null);
        setSubmissionSuccess(null);
      }
    }

    const result = await submitForm(definition, targetInstanceRef.current, valuesMap, t, errorsForSubmit, onSubmit, onValidation);
    const msg = typeof result.message === 'string' ? result.message : String(result.message);
    const errMsg = Object.values(result.errors ?? {}).join("\n");
    setSubmissionMessage(errMsg ? msg + "\n" + errMsg : msg);
    setSubmissionSuccess(result.success);

    if (!result.success) {
      // Roll back: restore instance name atomically via the ref
      targetInstanceRef.current.name = prevName ?? targetInstanceRef.current.name;
      setInstanceName(prevName ?? "");
    }
  }, [definition, instanceName, errors, updatedProperties, valuesMap, renderContext.fieldValidationMode, renderContext.definitionName, t, onSubmit, onValidation]);

  const hasErrorsInFields = React.useCallback(
    (fieldNames?: string[]) => {
      if (!fieldNames?.length) {
        return false;
      }

      const fields = updatedProperties.filter((field) => fieldNames.includes(field.name));
      return Object.keys(
        computeSubmitErrors(fields, valuesMap, renderContext.definitionName, t),
      ).length > 0;
    },
    [updatedProperties, valuesMap, renderContext.definitionName, t],
  );

  // Memoize submit-error computation separately so it only re-runs when data
  // actually changes, not on every field keypress.
  const isApplyDisabled = React.useMemo(
    () => isSubmitDisabled(renderContext.fieldValidationMode, errors),
    [renderContext.fieldValidationMode, errors]
  );

  // Render fields — optionally filtered to the given field names.
  // Wrapped in useCallback so the LayoutAdapter (memoized) only re-renders
  // when the fields or handlers actually change.
  const renderFields = React.useCallback((fieldNames?: string[]) => {
    const filtered = fieldNames
      ? updatedProperties.filter((p) => fieldNames.includes(p.name))
      : updatedProperties;
    const groups = computeVisibleGroups(filtered, visibility, visibilityRefStatus, loadedCount);

    return (
      <>
        {groups.map((group, index) => {
          if (group.name) {
            return (
              <FieldGroup
                key={group.name}
                groupName={group.name}
                defaultOpen={true}
                fields={group.fields}
                valuesMap={valuesMap}
                handleChange={handleChange}
                handleError={handleError}
                errorsMap={errors}
                t={t}
                disabledByRef={disabledByRef}
              />
            );
          }
          return (
            <React.Fragment key={`ungrouped-${index}`}>
              {group.fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={field}
                  valuesMap={valuesMap}
                  handleChange={handleChange}
                  handleError={handleError}
                  errorsMap={errors}
                  disabledByRef={disabledByRef}
                />
              ))}
            </React.Fragment>
          );
        })}
        {loadedCount < updatedProperties.length && (
          <div style={{ fontSize: '0.9em', color: 'var(--formitiva-text-muted, #666)' }}>
            {t(`Loading more fields...` + ` (${loadedCount}/${updatedProperties.length})`)}
          </div>
        )}
      </>
    );
  }, [updatedProperties, visibility, visibilityRefStatus, loadedCount, valuesMap, handleChange, handleError, errors, t, disabledByRef]);

  const renderSubmit = React.useCallback(() => (
    <>
      <hr style={{ border: 'none', borderTop: '1px solid var(--formitiva-border-color, #e5e7eb)', margin: '1rem 0' }} />
      <div style={{ display: 'flex-start', justifyContent: 'center' }}>
        <button onClick={handleSubmit} disabled={isApplyDisabled} className="formitiva-button formitiva-submit-button">
          {t("Submit")}
        </button>
      </div>
    </>
  ), [handleSubmit, isApplyDisabled, t]);

  // Expose imperative methods via forwardRef
  React.useImperativeHandle(ref, () => ({
    reset: () => {
      const init = initFormState(definition, instance, t);
      setUpdatedProperties(init.updatedProperties);
      setFieldMap(init.nameToField);
      setComputedRefFields(init.computedRefFields);
      setVisibilityRefFields(init.visibilityRefFields);
      setValuesMap(init.valuesMap);
      setVisibility(init.visibility);
      setVisibilityRefStatus(init.visibilityRefStatus);
      setDisabledByRef(init.disabledByRef);
      setErrors({});
      setSubmissionMessage(null);
      setSubmissionSuccess(null);
      setLoadedCount(0);
      setInitDone(true);
      setInstanceName(instance.name ?? "");
    },
    submit: () => { void handleSubmit(); },
    getValues: () => valuesMap,
    setValues: (incoming) => {
      setValuesMap((prev) => ({ ...prev, ...incoming }));
    },
  }), [definition, instance, t, handleSubmit, valuesMap]);

  return (
    <FormitivaContext.Provider value={renderContext}>
      <div style={formStyle.container}>
      {displayName && <h2 style={formStyle.titleStyle}>{t(displayName)}</h2>}
      {/* Display submission message on top*/}
      <SubmissionMessage
        message={submissionMessage}
        success={submissionSuccess}
        onDismiss={() => { setSubmissionMessage(null); setSubmissionSuccess(null); }}
      />
      {displayInstanceName && instance && (
        <InstanceName
          name={instanceName}
          onChange={(newName) => {
            // Only update the editable local name here. The actual instance
            // object's name will be updated only if a submit succeeds.
            setInstanceName(newName);
            setSubmissionMessage(null);
            setSubmissionSuccess(null);
          }}
        />
      )}
      {LayoutAdapter && activeLayout
        ? <LayoutAdapter layout={activeLayout} renderFields={renderFields} renderSubmit={renderSubmit} hasErrorsInFields={hasErrorsInFields} t={t} />
        : <>{renderFields()}{renderSubmit()}</>}
      </div>
    </FormitivaContext.Provider>
  );
});

FormitivaRenderer.displayName = 'FormitivaRenderer';

export default FormitivaRenderer;
