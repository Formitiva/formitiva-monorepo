// ─── Core types & model ────────────────────────────────────────────────────
export type {
  FieldValueType,
  ErrorType,
  ParentField,
  ValidatorRefType,
  DefinitionPropertyField,
  FormitivaDefinition,
  FormitivaInstance,
  FormitivaProps,
  TranslationFunction,
  FieldValidationMode,
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
  InputOnChange,
  BaseInputProps,
  FormitivaContextType,
  FormitivaProviderProps,
} from './core/formitivaTypes';

export {
  validateDefinitionSchema,
  loadJsonDefinition,
  createInstanceFromDefinition,
  loadInstance,
  upgradeInstanceToLatestDefinition,
} from './core/formitivaModel';

export type {
  LoadDefinitionOptions,
  DefinitionLoadResult,
  InstanceLoadResult,
} from './core/formitivaModel';

export { updateVisibilityMap, updateVisibilityBasedOnSelection } from './core/fieldVisibility';

export { submitForm } from './core/submitForm';
export type { SubmitResult } from './core/submitForm';

export { IS_TEST_ENV } from './core/env';

// ─── Registries ────────────────────────────────────────────────────────────
export { BaseRegistry } from './core/registries/baseRegistry';
export { default as baseRegistry } from './core/registries/baseRegistry';

export {
  registerSubmitter,
  registerSubmissionHandler,
  getSubmitter,
  getFormSubmissionHandler,
  getSubmissionHandler,
} from './core/registries/submissionHandlerRegistry';

export {
  registerButtonHandler,
  getButtonHandler,
  hasButtonHandler,
  unregisterButtonHandler,
  listButtonHandlers,
} from './core/registries/buttonHandlerRegistry';
export type { ButtonHandler } from './core/registries/buttonHandlerRegistry';

export {
  registerFormValidator,
  registerFieldValidator,
  registerTypeValidator,
  registerBuiltinTypeValidator,
  registerFormValidationHandler,
  registerFieldCustomValidationHandler,
  registerFieldTypeValidationHandler,
  registerBuiltinFieldTypeValidationHandler,
  getFieldValidator,
  getFormValidator,
  getTypeValidator,
  getFieldCustomValidationHandler,
  getFormValidationHandler,
  getFieldTypeValidationHandler,
  listFieldValidators,
  listFormValidators,
  listFieldCustomValidationHandlers,
  listFormValidationHandlers,
} from './core/registries/validationHandlerRegistry';

// ─── Validation ─────────────────────────────────────────────────────────────
export {
  validateField,
  validateFormValues,
  validateFieldWithCustomHandler,
} from './validation/validation';

export { ensureBuiltinFieldTypeValidatorsRegistered } from './validation/registerBuiltinTypeValidators';

// ─── Utils ──────────────────────────────────────────────────────────────────
export {
  isDefinitionPropertyField,
  isFormitivaDefinition,
  serializeInstance,
  deserializeInstance,
  serializeDefinition,
  deserializeDefinition,
} from './utils/definitionSerializers';
export type {
  SerializationOptions,
  DeserializationOptions,
  SerializationResult,
  DeserializationResult,
} from './utils/definitionSerializers';

export {
  renameDuplicatedGroups,
  groupConsecutiveFields,
} from './utils/groupingHelpers';

export {
  supportedLanguages,
  getSupportedLanguages,
  loadCommonTranslation,
  loadUserTranslation,
  clearTranslationCaches,
  createTranslationFunction,
  isDebugMode,
  userTranslationCache,
  userFailedSet,
} from './utils/translationUtils';
export type {
  TranslationMap,
  TranslationCache,
  TranslationLoadResult,
} from './utils/translationUtils';

export {
  dimensionUnitsMap,
  dimensionUnitDisplayMap,
  dimensonUnitFactorsMap,
  unitsByDimension,
  convertTemperature,
  getUnitFactors,
} from './utils/unitValueMapper';

// ─── Styles ─────────────────────────────────────────────────────────────────
export { CSS_CLASSES, combineClasses } from './styles/cssClasses';
export { isDarkTheme, isDarkColor } from './styles/themeUtils';
