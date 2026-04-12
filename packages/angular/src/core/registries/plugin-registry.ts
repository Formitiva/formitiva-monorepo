import { Type } from '@angular/core';
import { registerComponent, getComponent } from './component-registry';
import {
  registerFieldValidator,
  registerFormValidator,
  registerTypeValidator,
  getFormValidator,
  getTypeValidator,
} from '@formitiva/core';
import { registerSubmitter } from '@formitiva/core';
import type {
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
} from '@formitiva/core';

export type ConflictResolution = 'error' | 'warn' | 'override' | 'skip';

export interface PluginRegistrationOptions {
  conflictResolution?: ConflictResolution;
}

export interface FormitivaPlugin {
  name: string;
  version: string;
  description?: string;
  components?: Record<string, Type<unknown>>;
  fieldCustomValidators?: Record<string, Record<string, FieldCustomValidationHandler>>;
  fieldTypeValidators?: Record<string, FieldTypeValidationHandler>;
  formValidators?: Record<string, FormValidationHandler>;
  submissionHandlers?: Record<string, FormSubmissionHandler>;
  setup?: () => void;
  cleanup?: () => void;
}

const installedPlugins = new Map<string, FormitivaPlugin>();

export function registerPlugin(
  plugin: FormitivaPlugin,
  options: PluginRegistrationOptions = {}
): void {
  const { conflictResolution = 'warn' } = options;

  if (installedPlugins.has(plugin.name)) {
    if (conflictResolution === 'error') {
      throw new Error(`Plugin "${plugin.name}" is already registered.`);
    } else if (conflictResolution === 'skip') {
      return;
    }
  }

  installedPlugins.set(plugin.name, plugin);

  if (plugin.components) {
    for (const [type, component] of Object.entries(plugin.components)) {
      const existing = getComponent(type);
      if (existing && conflictResolution === 'warn') {
        console.warn(`[Formitiva] Plugin "${plugin.name}": component type "${type}" already registered.`);
      }
      if (!existing || conflictResolution === 'override') {
        registerComponent(type, component);
      }
    }
  }

  if (plugin.fieldCustomValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldCustomValidators)) {
      for (const [name, fn] of Object.entries(validators)) {
        registerFieldValidator(category, name, fn);
      }
    }
  }

  if (plugin.fieldTypeValidators) {
    for (const [type, fn] of Object.entries(plugin.fieldTypeValidators)) {
      const existing = getTypeValidator(type);
      if (existing && conflictResolution === 'warn') {
        console.warn(`[Formitiva] Plugin "${plugin.name}": field type validator "${type}" already registered.`);
      }
      if (!existing || conflictResolution === 'override') {
        registerTypeValidator(type, fn);
      }
    }
  }

  if (plugin.formValidators) {
    for (const [name, fn] of Object.entries(plugin.formValidators)) {
      const existing = getFormValidator(name);
      if (existing && conflictResolution === 'warn') {
        console.warn(`[Formitiva] Plugin "${plugin.name}": form validator "${name}" already registered.`);
      }
      if (!existing || conflictResolution === 'override') {
        registerFormValidator(name, fn);
      }
    }
  }

  if (plugin.submissionHandlers) {
    for (const [name, fn] of Object.entries(plugin.submissionHandlers)) {
      registerSubmitter(name, fn);
    }
  }

  if (plugin.setup) {
    plugin.setup();
  }
}

export function unregisterPlugin(pluginName: string): boolean {
  const plugin = installedPlugins.get(pluginName);
  if (!plugin) return false;
  if (plugin.cleanup) {
    plugin.cleanup();
  }
  installedPlugins.delete(pluginName);
  return true;
}

export function getPlugin(name: string): FormitivaPlugin | undefined {
  return installedPlugins.get(name);
}

export function getAllPlugins(): FormitivaPlugin[] {
  return Array.from(installedPlugins.values());
}

export function hasPlugin(name: string): boolean {
  return installedPlugins.has(name);
}
