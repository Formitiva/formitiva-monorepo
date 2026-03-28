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

// Vanilla-specific types
export type { FieldWidget, ButtonFieldWidget, FieldFactory, ButtonFieldFactory } from './core/fieldWidget';

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

// Context
export { createDefaultContext } from './context/formitivaContext';
export type { FormContext } from './context/formitivaContext';

// Utilities
export { createDebouncedCallback, useDebouncedCallback } from './hooks/useDebouncedCallback';
export type { DebouncedCallback } from './hooks/useDebouncedCallback';
export { createFieldValidator } from './hooks/useFieldValidator';
export type { ValidationTrigger } from './hooks/useFieldValidator';

// Components
export { Formitiva, default } from './components/form/Formitiva';
export { createFormitivaRenderer } from './components/form/FormitivaRenderer';
export type { FormitivaRendererOptions, FormitivaRendererResult } from './components/form/FormitivaRenderer';
export {
  createStandardFieldLayout,
  createInstanceNameWidget,
  createErrorDiv,
} from './components/layout/LayoutComponents';