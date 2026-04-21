// ─── Core types & model ────────────────────────────────────────────────────
export type {
  FieldValueType,
  ErrorType,
  ParentField,
  ValidatorRefType,
  FieldVisibilityStatus,
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
  LayoutSection,
  LayoutConfig,
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

export { updateVisibilityMap, updateVisibilityBasedOnSelection, applyVisibilityRefs, applyComputedRefs } from './core/fieldVisibility';

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
  registerVisibilityHandler,
  getVisibilityHandler,
  hasVisibilityHandler,
  unregisterVisibilityHandler,
  listVisibilityHandlers,
} from './core/registries/visibilityHandlerRegistry';
export type { VisibilityHandler } from './core/registries/visibilityHandlerRegistry';

export {
  registerComputedValueHandler,
  getComputedValueHandler,
  hasComputedValueHandler,
  unregisterComputedValueHandler,
  listComputedValueHandlers,
} from './core/registries/computedValueHandlerRegistry';
export type { ComputedValueHandler } from './core/registries/computedValueHandlerRegistry';

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

// ─── Layout Registry ────────────────────────────────────────────────────
export {
  registerLayout,
  getLayout,
} from './core/registries/layoutRegistry';

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
  loadTranslationMaps,
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
  TranslationMaps,
} from './utils/translationUtils';

export {
  buildFieldMap,
  initFormState,
  computeFieldChange,
  computeVisibleGroups,
  computeSubmitErrors,
  isSubmitDisabled,
} from './utils/formStateUtils';
export type {
  FieldMapResult,
  FormStateInit,
  FieldChangeResult,
  VisibleGroup,
} from './utils/formStateUtils';

export {
  normalizeUnit,
  computeUnitValueState,
  emitUnitValueChange,
} from './utils/unitValueFieldUtils';
export type {
  UnitFactors,
  UnitValueState,
} from './utils/unitValueFieldUtils';

export {
  dimensionUnitsMap,
  dimensionUnitDisplayMap,
  dimensionUnitFactorsMap,
  unitsByDimension,
  convertTemperature,
  getUnitFactors,
} from './utils/unitValueMapper';

export {
  buildFormStyle,
  buildFieldStyle,
} from './utils/styleConfig';
export type {
  FormStyle,
  FieldStyle,
  StyleMap,
} from './utils/styleConfig';

export {
  createDebouncedCallback,
} from './utils/debouncedCallback';
export type {
  DebouncedCallback,
} from './utils/debouncedCallback';

export {
  resolveFieldValidation,
} from './utils/fieldValidatorUtils';
export type {
  ValidationTrigger,
} from './utils/fieldValidatorUtils';

export {
  computeDropdownPosition,
} from './utils/dropdownPositionUtils';
export type {
  DropdownPosition,
} from './utils/dropdownPositionUtils';

// ─── Styles ─────────────────────────────────────────────────────────────────
export { CSS_CLASSES, combineClasses } from './styles/cssClasses';
export { isDarkTheme, isDarkColor } from './styles/themeUtils';
