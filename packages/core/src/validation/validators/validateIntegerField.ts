// src/validation/validateIntegerField.ts
// Validation logic for integer and integer array fields
// "int" and "stepper" field types share the same validation logic

import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

function isValidInteger(input: string) {
  // Regex to validate integer input (optional leading + or -)
  const validIntegerRegex = /^[-+]?\d*$/;
  return validIntegerRegex.test(input);
}

function isValidIntegerArray(input: string) {
  const integerRegex = /^[-+]?\d*$/;
  return input
    .split(",")
    .map((item) => item.trim())
    .every((val) => integerRegex.test(val));
}

const delimiter = ",";
const parseArray = (text: string): number[] => {
  if (!text || text.trim() === "") return [];
  return text
    .split(delimiter)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number(v));
};

export const validateIntegerField = (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined => {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    if (field.min !== undefined || field.max !== undefined) {
      return t("Value required when min or max constraints is set");
    }
    return field.required ? t("Value required") : undefined;
  }

  // Check integer format. This is needed because parseInt will parse partial strings.
  if (!isValidInteger(inputStr)) {
    return t("Must be a valid integer");
  }

  const parsedValue = parseInt(inputStr, 10);
  if (Number.isNaN(parsedValue)) return t("Must be a valid integer");

  // Check min constraints
  if (field.min !== undefined) {
    const tooLow = field.minInclusive
      ? parsedValue < field.min
      : parsedValue <= field.min;
    if (tooLow) {
      return t(
        "Must be {{1}} {{2}}",
        field.minInclusive ? "\u2265" : ">",
        field.min
      );
    }
  }

  // Check max constraints
  if (field.max !== undefined) {
    const tooHigh = field.maxInclusive
      ? parsedValue > field.max
      : parsedValue >= field.max;
    if (tooHigh) {
      return t(
        "Must be {{1}} {{2}}",
        field.maxInclusive ? "\u2264" : "<",
        field.max
      );
    }
  }

  // Validate step increments for integer fields. If a step is provided and
  // is an integer, require the parsed value to be a multiple of the step.
  if (field.step !== undefined) {
    const stepVal = Number(field.step);
    if (!Number.isInteger(stepVal)) {
      // Non-integer step is invalid for IntegerInput
      return t("Invalid step value");
    }
    if (parsedValue % stepVal !== 0) {
      return t("Must be a multiple of {{1}}", stepVal);
    }
  }

  return undefined;
};

export function validateIntegerArrayField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const inputStr = String(input);
  if (inputStr.trim() === "") {
    if (field.min !== undefined || field.max !== undefined) {
      return t("Value required when min or max constraints is set");
    }
    return field.required ? t("Value required") : undefined;
  }

  if (!isValidIntegerArray(inputStr)) {
    return t("Each value must be a valid integer");
  }

  const numbers = parseArray(inputStr);

  if (field.minCount !== undefined && numbers.length < field.minCount) {
    return t("Minimum number of values: {{1}}", `${field.minCount}`);
  }

  if (field.maxCount !== undefined && numbers.length > field.maxCount) {
    return t("Maximum number of values: {{1}}", `${field.maxCount}`);
  }

  for (const num of numbers) {
    if (field.min !== undefined) {
      const belowLimit = field.minInclusive
        ? num < field.min
        : num <= field.min;
      if (belowLimit) {
        return t(
          "Each value must be {{1}} {{2}}",
          field.minInclusive ? "\u2265" : ">",
          field.min
        );
      }
    }

    if (field.max !== undefined) {
      const aboveLimit = field.maxInclusive
        ? num > field.max
        : num >= field.max;
      if (aboveLimit) {
        return t(
          "Each value must be {{1}} {{2}}",
          field.maxInclusive ? "\u2264" : "<",
          field.max
        );
      }
    }
  }

  return undefined;
}
