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

import { registerBuiltinTypeValidator } from "../core/registries/validationHandlerRegistry";

let registered = false;
/**
 * Ensures all built-in field validators are registered.
 * This function references all validators to prevent tree-shaking.
 * Safe to call multiple times as handlers are keyed.
 */
export function ensureBuiltinFieldTypeValidatorsRegistered(): void {
  if (registered) return;
  registerBuiltinTypeValidator("int", validateIntegerField);
  registerBuiltinTypeValidator("stepper", validateIntegerField);
  registerBuiltinTypeValidator("int-array", validateIntegerArrayField);
  registerBuiltinTypeValidator("float", validateFloatField);
  registerBuiltinTypeValidator("slider", validateSliderField);
  registerBuiltinTypeValidator("float-array", validateFloatArrayField);
  registerBuiltinTypeValidator("text", validateTextField);
  registerBuiltinTypeValidator("string", validateTextField);
  registerBuiltinTypeValidator("multiline", validateTextField);
  registerBuiltinTypeValidator("password", validateTextField);
  registerBuiltinTypeValidator("email", validateEmailField);
  registerBuiltinTypeValidator("date", validateDateField);
  registerBuiltinTypeValidator("time", validateTimeField);
  registerBuiltinTypeValidator("url", validateUrlField);
  registerBuiltinTypeValidator("phone", validatePhoneField);
  registerBuiltinTypeValidator("unit", validateUnitValueField);
  registerBuiltinTypeValidator("dropdown", validateDropdownField);
  registerBuiltinTypeValidator("multi-selection", validateMultiSelectionField);
  registerBuiltinTypeValidator("color", validateColorField);
  registerBuiltinTypeValidator("rating", validateRatingField);
  registerBuiltinTypeValidator("file", validateFileField);
  registered = true;
}

// Call at module load to ensure registration in typical usage
ensureBuiltinFieldTypeValidatorsRegistered();
