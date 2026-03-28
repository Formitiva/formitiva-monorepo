// CSS injection
import FormitivaCss from '@formitiva/core/styles/formitiva.css?raw';

export function injectFormitivaStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('formitiva-styles')) return;
  try {
    const style = document.createElement('style');
    style.id = 'formitiva-styles';
    style.textContent = FormitivaCss as string;
    document.head.appendChild(style);
  } catch { /* Fail silently in non-browser environments */ }
}
if (typeof document !== 'undefined') injectFormitivaStyles();

// Re-export everything from the shared core
export * from '@formitiva/core';

// Framework-specific component registry
export {
  registerComponent,
  getComponent,
  isBuiltinComponentType,
  DEBOUNCE_CONFIG,
  registerBaseComponents,
} from './core/registries/componentRegistry';
export type { DebounceConfig } from './core/registries/componentRegistry';

// Plugin system
export {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  hasPlugin,
  registerComponents,
} from './core/registries/pluginRegistry';
export type {
  FormitivaPlugin,
  ConflictResolution,
  PluginRegistrationOptions,
  PluginConflict,
} from './core/registries/pluginRegistry';

// Composables
export { useDebouncedCallback } from './hooks/useDebouncedCallback';
export type { DebouncedCallback } from './hooks/useDebouncedCallback';
export { useDropdownPosition } from './hooks/useDropdownPosition';
export { useFieldValidator } from './hooks/useFieldValidator';
export {
  default as useFormitivaContext,
  provideFormitivaContext,
  FormitivaContextKey,
} from './hooks/useFormitivaContext';
export { useUncontrolledValidatedInput } from './hooks/useUncontrolledValidatedInput';
export { useUnitValueField } from './hooks/useUnitValueField';

// Components
export { default as Formitiva } from './components/form/Formitiva.vue';
export { default as FormitivaRenderer } from './components/form/FormitivaRenderer.vue';
export { default as FormitivaProvider } from './components/form/FormitivaProvider.vue';
export {
  StandardFieldLayout,
  ColumnFieldLayout,
  RowFieldLayout,
  InstanceName,
} from './components/layout/LayoutComponents';