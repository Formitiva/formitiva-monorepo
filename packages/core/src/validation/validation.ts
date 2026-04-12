import type {
  FormitivaDefinition,
  FieldCustomValidationHandler,
  FormValidationHandler,
  FieldValueType,
  DefinitionPropertyField,
  TranslationFunction,
} from "../core/formitivaTypes";

import {
  getTypeValidator,
  getFieldValidator,
  getFormValidator,
} from "../core/registries/validationHandlerRegistry";

function isThenable<T = unknown>(v: unknown): v is PromiseLike<T> {
  return (
    (typeof v === "object" || typeof v === "function") &&
    v !== null &&
    typeof (v as PromiseLike<T>).then === "function"
  );
}

// Cache for validation handlers to avoid repeated lookups
const fieldHandlerCache = new Map<string, FieldCustomValidationHandler | null>();
const formHandlerCache = new Map<string, FormValidationHandler | null>();

function getFieldValidatorRef(field: DefinitionPropertyField): DefinitionPropertyField["validatorRef"] | undefined {
  const legacyCompatibleField = field as DefinitionPropertyField & {
    validationHandlerName?: DefinitionPropertyField["validatorRef"];
  };

  return legacyCompatibleField.validatorRef ?? legacyCompatibleField.validationHandlerName;
}

function getFormValidatorRef(definition: FormitivaDefinition): string | undefined {
  const legacyCompatibleDefinition = definition as FormitivaDefinition & {
    validationHandlerName?: string;
  };

  if (typeof legacyCompatibleDefinition.validatorRef === "string") {
    return legacyCompatibleDefinition.validatorRef;
  }

  if (typeof legacyCompatibleDefinition.validationHandlerName === "string") {
    return legacyCompatibleDefinition.validationHandlerName;
  }

  return undefined;
}

// Validate a single field value using its validation handler
// Returns first error string or null if valid
export function validateFieldWithCustomHandler(
  definitionName: string,
  field: DefinitionPropertyField,
  value: FieldValueType,
  t: TranslationFunction
): string | null {
  if (!field) {
    return null;
  }

  const validatorRef = getFieldValidatorRef(field);
  if (!validatorRef) {
    return null;
  }

  let category: string;
  let key: string;
  
  if (typeof validatorRef === "string") {
    category = definitionName;
    key = validatorRef;
  } else if (Array.isArray(validatorRef)) {
    const [cat, k] = validatorRef;
    if (k) {
      category = cat;
      key = k;
    } else if (cat) {
      category = definitionName;
      key = cat;
    } else {
      return null;
    }
  } else {
    return null;
  }

  const cacheKey = `${category}:${key}`;

  // Check cache first
  let validationHandler = fieldHandlerCache.get(cacheKey);
  if (validationHandler === undefined) {
    // Lookup by category and handler name
    validationHandler = getFieldValidator(category, key) || null;
    fieldHandlerCache.set(cacheKey, validationHandler);
  }

  if (validationHandler) {
    try {
      const res = validationHandler(field.name, value, t);
      return res || null;
    } catch (err) {
      // If validation throws, surface as error string
      return String(err instanceof Error ? err.message : err);
    }
  }
  return null;
}

// Deprecated: use validateFieldWithCustomHandler instead
export function validateFieldValue(
  definitionName: string,
  field: DefinitionPropertyField,
  value: FieldValueType | unknown,
  t: TranslationFunction
): string | null {
  return validateFieldWithCustomHandler(definitionName, field, value as FieldValueType, t);
}

export function validateField(
  definitionName: string,
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | null {
  const typeValidator = getTypeValidator(field.type);
  if (typeValidator) {
    const err = typeValidator(field, input, t);
    if (err) {
      return err;
    }
  } else {
    // Fallback to required check if no builtin validator
    const inputStr = String(input ?? "").trim();
    if (inputStr === "") {
      return field.required ? t("Value required") : null;
    }
  }

  return validateFieldWithCustomHandler(definitionName, field, input, t);
}


// Validate entire form values using form-level validation handler
// Returns array of error strings or null if valid
export async function validateFormValues(
  definition: FormitivaDefinition | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: (key: string) => string
): Promise<string[] | null> {
  if (!definition) {
    return null;
  }

  const handlerName = getFormValidatorRef(definition);
  if (!handlerName) {
    return null;
  }

  // Check cache first
  let validationHandler = formHandlerCache.get(handlerName);
  if (validationHandler === undefined) {
    validationHandler = getFormValidator(handlerName) || null;
    formHandlerCache.set(handlerName, validationHandler);
  }

  if (validationHandler) {
    try {
      const res = validationHandler(valuesMap, t);
      if (isThenable(res)) {
        return (await res) || null;
      }
      return (res as string[] | undefined) || null;
    } catch (err) {
      return [String(err instanceof Error ? err.message : err)];
    }
  }
  return null;
}

// Clear cache (useful for testing or dynamic handler updates)
export function clearValidationCache(): void {
  fieldHandlerCache.clear();
  formHandlerCache.clear();
}

export default {
  validateFieldValue,
  validateFormValues,
  clearValidationCache,
};
