/**
 * @fileoverview Built-in validator registration
 * @description Imports all validator modules for side-effect registration.
 * Re-exports all validators to ensure bundlers don't tree-shake them.
 */

// Import all validators for side-effect registration
import { validateIntegerArrayField, validateIntegerField } from "./validators/validateIntegerField";
import { validateFloatArrayField, validateFloatField } from "./validators/validateFloatField";
import { validateTextField } from "./validators/validateTextField";
import { validateDateField } from "./validators/validateDateField";
import { validateTimeField } from "./validators/validateTimeField";
import { validateEmailField } from "./validators/validateEmailField";
import { validatePhoneField } from "./validators/validatePhoneField";
import { validateUrlField } from "./validators/validateUrlField";
import { validateUnitValueField } from "./validators/validateUnitValueField";
import { validateFileField } from "./validators/validateFileField";
import { validateDropdownField, validateMultiSelectionField } from "./validators/validateSelectionFields";
import { validateColorField } from "./validators/validateColorField";
import { validateRatingField } from "./validators/validateRatingField";
import { validateSliderField } from "./validators/validateSliderField";

import { registerBuiltinFieldTypeValidationHandler } from "../core/registries/validationHandlerRegistry";

let registed = false;
/**
 * Ensures all built-in field validators are registered.
 * This function references all validators to prevent tree-shaking.
 * Safe to call multiple times as handlers are keyed.
 */
export function ensureBuiltinFieldTypeValidatorsRegistered(): void {
  if (registed) return;
  registerBuiltinFieldTypeValidationHandler("int", validateIntegerField);
  registerBuiltinFieldTypeValidationHandler("stepper", validateIntegerField);
  registerBuiltinFieldTypeValidationHandler("int-array", validateIntegerArrayField);
  registerBuiltinFieldTypeValidationHandler("float", validateFloatField);
  registerBuiltinFieldTypeValidationHandler("slider", validateSliderField);
  registerBuiltinFieldTypeValidationHandler("float-array", validateFloatArrayField);
  registerBuiltinFieldTypeValidationHandler("text", validateTextField);
  registerBuiltinFieldTypeValidationHandler("string", validateTextField);
  registerBuiltinFieldTypeValidationHandler("multiline", validateTextField);
  registerBuiltinFieldTypeValidationHandler("password", validateTextField);
  registerBuiltinFieldTypeValidationHandler("email", validateEmailField);
  registerBuiltinFieldTypeValidationHandler("date", validateDateField);
  registerBuiltinFieldTypeValidationHandler("time", validateTimeField);
  registerBuiltinFieldTypeValidationHandler("url", validateUrlField);
  registerBuiltinFieldTypeValidationHandler("phone", validatePhoneField);
  registerBuiltinFieldTypeValidationHandler("unit", validateUnitValueField);
  registerBuiltinFieldTypeValidationHandler("dropdown", validateDropdownField);
  registerBuiltinFieldTypeValidationHandler("multi-selection", validateMultiSelectionField);
  registerBuiltinFieldTypeValidationHandler("color", validateColorField);
  registerBuiltinFieldTypeValidationHandler("rating", validateRatingField);
  registerBuiltinFieldTypeValidationHandler("file", validateFileField);
  registed = true;
}

// Call at module load to ensure registration in typical usage
ensureBuiltinFieldTypeValidatorsRegistered();
