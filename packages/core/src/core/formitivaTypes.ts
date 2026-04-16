// You can't enforce Integer vs Float at compile time in TS, so both are number aliases
type Integer = number;
type Float = number;

export type FieldValueType =
  | boolean
  | Integer
  | Float
  | string
  | Integer[]
  | Float[]
  | string[]
  | [number, string]
  | File
  | File[];

export type ErrorType = string | null;

export type ParentField = Record<string, string[] | Integer[] | boolean[]>;

export type ValidatorRefType =
  | string
  | [string]
  | [string, string];

export type FieldVisibilityStatus = 'visible' | 'invisible' | 'enable' | 'disable';

export interface DefinitionPropertyField {
  name: string;
  displayName: string;
  type: string; // 'string' | 'number' | 'boolean' | etc.
  defaultValue: FieldValueType;
  disabled?: boolean;
  required?: boolean;
  parents?: ParentField;
  children?: Record<string, string[]>;
  group?: string;
  tooltip?: string;
  labelLayout?: 'row' | 'column-left' | 'column-center';

  // Custom validator reference
  validatorRef?: ValidatorRefType;

  // Custom visibility handler reference
  visibilityRef?: string;

  // Computed value handler reference
  computedRef?: string;

  // Unit field properties
  dimension?: string; // for 'unit' type fields, e.g. 'length', 'angle', etc.
  defaultUnit?: string; // for 'unit' type fields

  // Enum/select field properties
  options?: Array<{ label: string; value: string }>;

  // Text/String field properties
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternErrorMessage?: string;
  placeholder?: string;

  // Numeric field properties
  min?: number;
  max?: number;
  minInclusive?: boolean;
  maxInclusive?: boolean;
  step?: number;

  // Array/collection properties
  minCount?: number;
  maxCount?: number;

  // Date/Time field properties
  minDate?: string;
  maxDate?: string;
  includeSeconds?: boolean; // for 'time' type fields

  // Layout properties
  layout?: 'horizontal' | 'vertical' | 'row' | 'column';
  alignment?: 'left' | 'center' | 'right';

  // Image/Display properties
  width?: number | string;
  height?: number;
  localized?: string;
  minHeight?: string; // For textarea minimum height

  // File input properties
  accept?: string; // e.g. "image/*,.pdf"
  multiple?: boolean;

  // Url input properties
  allowRelative?: boolean; // for 'url' type fields

  // Button properties
  action?: string; // for 'button' type fields - name of registered button handler
  buttonText?: string; // for 'button' type fields - text to display on the button

  // Description properties
  displayText?: string | string[]; // for 'description' type fields
  textAlign?: 'left' | 'center' | 'right';
}

export interface FormitivaDefinition {
  name: string;
  version: string;
  displayName: string;
  localization?: string;
  properties: DefinitionPropertyField[];
  validatorRef?: string;
  submitterRef?: string;
}

export interface FormitivaInstance {
  name: string;
  definition: string;
  version: string;
  values: Record<string, FieldValueType>;
}

export interface FormitivaProps {
  definitionData: string | Record<string, unknown> | FormitivaDefinition;
  language?: string;
  instance?: FormitivaInstance;
  className?: string;
  theme?: string;
  style?: Partial<CSSStyleDeclaration>;
  fieldValidationMode?: FieldValidationMode;
  displayInstanceName?: boolean;
  onSubmit?: FormSubmissionHandler;
  onValidation?: FormValidationHandler;
}

// Translation helper types
export type TranslationFunction = (text: string, ...args: unknown[]) => string;

/**
 * Validation mode controls when field validation fires.
 * 'onEdit' (default) — validate as the user types.
 * 'onBlur'           — validate when the field loses focus.
 * 'onSubmission'     — validate only on form submit.
 * 'realTime'         — deprecated alias for 'onEdit'.
 */
export type FieldValidationMode = 'onEdit' | 'onBlur' | 'onSubmission' | 'realTime';

// Field validator (custom, per-definition)
export type FieldCustomValidationHandler = (
  fieldName: string,
  value: FieldValueType | unknown,
  t: TranslationFunction,
) => string | undefined;

// Field type validator (built-in or custom, per field type)
export type FieldTypeValidationHandler = (
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction,
) => string | undefined;

// Form-level validator (cross-field)
export type FormValidationHandler = (
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
) => string[] | Promise<string[] | undefined> | undefined;

// Submission handler
export type FormSubmissionHandler = (
  definition: FormitivaDefinition,
  instanceName: string | null,
  valuesMap: Record<string, FieldValueType | unknown>,
  t: TranslationFunction,
) => string[] | undefined | Promise<string[] | undefined>;

// Generic input change callback
export type InputOnChange<T> = (value: T | string) => void;

// Shared base props for input components
export interface BaseInputProps<
  TValue = unknown,
  TField extends DefinitionPropertyField = DefinitionPropertyField
> {
  field: TField;
  value: TValue;
  disabled?: boolean;
  placeholder?: string;
  onChange?: InputOnChange<TValue>;
  onError?: (error: string | null) => void;
  error?: string | null;
}

// Shared context type (framework packages extend this)
export type FormitivaContextType = {
  definitionName: string;
  language: string;
  theme: string;
  formStyle: Record<string, Record<string, string | number | undefined>>;
  fieldStyle: Record<string, Record<string, string | number | undefined>>;
  t: TranslationFunction;
  fieldValidationMode: FieldValidationMode;
  displayInstanceName: boolean;
};

// Provider props base (framework packages extend this)
export type FormitivaProviderProps = {
  definitionName?: string;
  defaultStyle?: Record<string, unknown>;
};
