// Re-export everything from the shared core
export * from '@formitiva/core';

// Angular module & main entry component
export { FormitivaModule } from './formitiva.module';
export { FormitivaComponent } from './components/form/formitiva.component';
export { FormitivaRendererComponent } from './components/form/formitiva-renderer.component';
export { SubmissionMessageComponent } from './components/form/submission-message.component';

// Field components
export {
  TextInputComponent,
  IntegerInputComponent,
  FloatInputComponent,
  MultilineTextInputComponent,
  IntegerArrayInputComponent,
  FloatArrayInputComponent,
  NumericStepperInputComponent,
  PasswordInputComponent,
} from './components/fields/text-numeric/text-numeric-fields.component';
export {
  CheckboxInputComponent,
  SwitchInputComponent,
  RadioInputComponent,
  DropdownInputComponent,
  MultiSelectionComponent,
} from './components/fields/choices/choice-fields.component';
export {
  DateInputComponent,
  TimeInputComponent,
} from './components/fields/date-time/date-time-fields.component';
export {
  EmailInputComponent,
  PhoneInputComponent,
  UrlInputComponent,
  ColorInputComponent,
  SliderInputComponent,
  RatingInputComponent,
  FileInputComponent,
  UnitValueInputComponent,
} from './components/fields/advanced/advanced-fields.component';
export {
  ButtonComponent,
  DescriptionComponent,
  ImageDisplayComponent,
  SeparatorComponent,
} from './components/fields/ui-elements/ui-elements.component';

// Base field classes & layout
export {
  BaseFieldComponent,
  ReactiveStringFieldComponent,
} from './components/fields/base/base-field.component';
export {
  StandardFieldLayoutComponent,
  InstanceNameComponent,
} from './components/layout/layout-components.component';
export { FieldRendererComponent } from './components/layout/field-renderer.component';
export { FieldGroupComponent } from './components/layout/field-group.component';

// Services
export { FormitivaContextService } from './services/formitiva-context.service';
export { FieldValidatorService } from './services/field-validator.service';
export type { ValidationTrigger } from './services/field-validator.service';
export { LayoutRenderContextService } from './services/layout-render-context.service';
export type { LayoutVisibleGroup } from './services/layout-render-context.service';

// Framework-specific registries
export {
  registerComponent,
  getComponent,
  hasComponent,
  registerBaseComponents,
  isBuiltinComponentType,
  DEBOUNCE_CONFIG,
} from './core/registries/component-registry';
export type { DebounceConfig } from './core/registries/component-registry';
export {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin,
} from './core/registries/plugin-registry';
export type { FormitivaPlugin } from './core/registries/plugin-registry';

// Layout adapter registry
export {
  registerLayoutAdapter,
  getLayoutAdapter,
  clearLayoutAdapter,
} from './core/registries/layout-adapter-registry';
export type { AngularLayoutAdapter } from './core/registries/layout-adapter-registry';
