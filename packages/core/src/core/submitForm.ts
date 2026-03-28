import type {
  FormitivaDefinition,
  FieldValueType,
  FormitivaInstance,
  TranslationFunction,
  FormSubmissionHandler,
  FormValidationHandler,
} from './formitivaTypes';
import { validateFormValues } from '../validation/validation';
import { getFormSubmissionHandler } from './registries/submissionHandlerRegistry';

export interface SubmitResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

export async function submitForm(
  definition: FormitivaDefinition,
  instance: FormitivaInstance | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
  errors?: Record<string, string>,
  onSubmit?: FormSubmissionHandler | undefined,
  onValidation?: FormValidationHandler | undefined,
): Promise<SubmitResult> {
  void instance;

  const existingErrors = errors ? Object.values(errors).filter(Boolean) : [];
  if (existingErrors.length > 0) {
    return {
      success: false,
      message: t('Please fix validation errors before submitting the form.'),
      errors: existingErrors,
    };
  }

  const finalMap: Record<string, FieldValueType | unknown> = { ...valuesMap };
  const transformationErrors: string[] = [];

  if (definition && Array.isArray(definition.properties)) {
    for (const prop of definition.properties) {
      const propName = prop.name;
      const raw = finalMap[propName];
      if (raw === undefined || raw === null) continue;
      const schemaType = prop.type;
      try {
        if (schemaType === 'int') {
          const strValue = String(raw).trim();
          if (strValue === '') {
            finalMap[propName] = 0;
          } else {
            const numValue = Number(strValue);
            if (!Number.isInteger(numValue)) {
              transformationErrors.push(t('Invalid integer format for field {{1}}', prop.displayName || propName));
            } else {
              finalMap[propName] = Math.trunc(numValue);
            }
          }
        } else if (schemaType === 'number' || schemaType === 'float') {
          const strValue = String(raw).trim();
          if (strValue === '') {
            finalMap[propName] = 0;
          } else {
            const numValue = Number(strValue);
            if (isNaN(numValue)) {
              transformationErrors.push(t('Invalid number format for field {{1}}', prop.displayName || propName));
            } else {
              finalMap[propName] = numValue;
            }
          }
        } else if (schemaType === 'int-array' || schemaType === 'float-array') {
          const arr = String(raw).split(',').map((v) => v.trim()).filter(Boolean);
          const numArr: number[] = [];
          let hasError = false;
          for (const v of arr) {
            const num = Number(v);
            if (isNaN(num)) {
              transformationErrors.push(t('Invalid number {{1}} in array for field {{2}}', v, prop.displayName || propName));
              hasError = true;
              break;
            }
            numArr.push(num);
          }
          if (!hasError) finalMap[propName] = numArr;
        }
      } catch (error) {
        transformationErrors.push(
          t('Error processing field {{1}}: {{2}}', prop.displayName || propName, error instanceof Error ? error.message : String(error)),
        );
      }
    }
  }

  if (transformationErrors.length > 0) {
    return { success: false, message: t('Data transformation errors occurred.'), errors: transformationErrors };
  }

  if (onValidation) {
    const validationErrors = await onValidation(finalMap, t);
    if (validationErrors && validationErrors.length > 0) {
      return { success: false, message: t('Validation failed'), errors: validationErrors };
    }
  } else {
    const validationErrors = await validateFormValues(definition, finalMap, t);
    if (validationErrors && validationErrors.length > 0) {
      return { success: false, message: t('Validation failed'), errors: validationErrors };
    }
  }

  const normalizeSubmitResult = (res: unknown): string[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res.map((r) => String(r));
    if (typeof res === 'string') return res.trim() ? [res] : [];
    return [String(res)];
  };

  if (onSubmit) {
    try {
      const result = await onSubmit(definition, instance?.name ?? null, finalMap, t);
      const submitErrors = normalizeSubmitResult(result);
      if (submitErrors.length > 0) {
        return { success: false, message: t('Submission failed'), errors: submitErrors };
      }
    } catch (error) {
      return {
        success: false,
        message: t('Submission handler error occurred'),
        errors: [String(error instanceof Error ? error.message : error)],
      };
    }
  } else if (definition && typeof definition.submitHandlerName === 'string') {
    const submitHandler = getFormSubmissionHandler(definition.submitHandlerName);
    if (submitHandler) {
      try {
        const result = await submitHandler(definition, instance?.name ?? null, finalMap, t);
        const submitErrors = normalizeSubmitResult(result);
        if (submitErrors.length > 0) {
          return { success: false, message: t('Submission failed'), errors: submitErrors };
        }
      } catch (error) {
        return {
          success: false,
          message: t('Submission handler error occurred'),
          errors: [String(error instanceof Error ? error.message : error)],
        };
      }
    }
  }

  return { success: true, message: t('Form submitted successfully.'), data: finalMap };
}

export default submitForm;
