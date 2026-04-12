/**
 * Enhanced Plugin Registry for Formitiva
 * Tracks installed plugins, components, validators, submission handlers
 */

import {
  registerComponent,
  getComponent,
} from './componentRegistry';
import {
  registerFieldValidator,
  registerFormValidator,
  registerTypeValidator,
  getFieldValidator,
  getFormValidator,
  getTypeValidator,
} from '@formitiva/core';
import {
  registerSubmitter,
  getSubmitter,
} from '@formitiva/core';

import type {
  FieldCustomValidationHandler,
  FieldTypeValidationHandler,
  FormValidationHandler,
  FormSubmissionHandler,
} from '@formitiva/core';

export type ConflictResolution = 'error' | 'warn' | 'override' | 'skip';

export interface PluginRegistrationOptions {
  conflictResolution?: ConflictResolution;
  onConflict?: (conflict: PluginConflict) => boolean;
}

export interface PluginConflict {
  type: 'component' | 'fieldCustomValidator' | 'fieldTypeValidator' | 'formValidator' | 'submissionHandler' | 'plugin';
  name: string;
  existingPlugin: string;
  newPlugin: string;
}

export interface FormitivaPlugin {
  name: string;
  version: string;
  description?: string;
  components?: Record<string, unknown>;
  fieldCustomValidators?: Record<string, Record<string, FieldCustomValidationHandler>>;
  fieldTypeValidators?: Record<string, FieldTypeValidationHandler>;
  formValidators?: Record<string, FormValidationHandler>;
  submissionHandlers?: Record<string, FormSubmissionHandler>;
  setup?: () => void;
  cleanup?: () => void;
}

const installedPlugins = new Map<string, FormitivaPlugin>();

const registrationOwnership = {
  components: new Map<string, string>(),
  fieldValidators: new Map<string, Map<string, string>>(),
  fieldTypeValidators: new Map<string, string>(),
  formValidators: new Map<string, string>(),
  submissionHandlers: new Map<string, string>(),
};

function shouldRegister(
  conflict: PluginConflict | null,
  strategy: ConflictResolution,
  onConflict?: (conflict: PluginConflict) => boolean
): boolean {
  if (!conflict) return true;
  if (onConflict) {
    const proceed = onConflict(conflict);
    if (!proceed) return false;
  }
  switch (strategy) {
    case 'error':
      throw new Error(`Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" already registered by "${conflict.existingPlugin}"`);
    case 'warn':
      console.warn(`Plugin conflict: "${conflict.newPlugin}" tried to register ${conflict.type} "${conflict.name}" already registered by "${conflict.existingPlugin}". Skipping.`);
      return false;
    case 'override':
      console.info(`Plugin "${conflict.newPlugin}" is overriding ${conflict.type} "${conflict.name}" previously registered by "${conflict.existingPlugin}"`);
      return true;
    case 'skip':
      return false;
  }
}

function handleConflicts(plugin: FormitivaPlugin): PluginConflict[] {
  const conflicts: PluginConflict[] = [];
  if (plugin.components) {
    for (const type of Object.keys(plugin.components)) {
      const existing = getComponent(type);
      if (existing) {
        let existingPlugin: string | undefined;
        for (const [pname, p] of installedPlugins) {
          if (p.components && p.components[type] === existing) { existingPlugin = pname; break; }
        }
        if (existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({ type: 'component', name: type, existingPlugin, newPlugin: plugin.name });
        }
      }
    }
  }
  if (plugin.fieldCustomValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldCustomValidators)) {
      for (const name of Object.keys(validators)) {
        const categoryMap = registrationOwnership.fieldValidators.get(category);
        const existingPlugin = categoryMap?.get(name);
        const existingHandler = getFieldValidator(category, name);
        if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
          conflicts.push({ type: 'fieldCustomValidator', name: `${category}:${name}`, existingPlugin, newPlugin: plugin.name });
        }
      }
    }
  }
  if (plugin.fieldTypeValidators) {
    for (const name of Object.keys(plugin.fieldTypeValidators)) {
      const existingHandler = getTypeValidator(name);
      const existingPlugin = registrationOwnership.fieldTypeValidators.get(name);
      if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
        conflicts.push({ type: 'fieldTypeValidator', name: `type:${name}`, existingPlugin, newPlugin: plugin.name });
      }
    }
  }
  if (plugin.formValidators) {
    for (const name of Object.keys(plugin.formValidators)) {
      const existingHandler = getFormValidator(name);
      const existingPlugin = registrationOwnership.formValidators.get(name);
      if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
        conflicts.push({ type: 'formValidator', name, existingPlugin, newPlugin: plugin.name });
      }
    }
  }
  if (plugin.submissionHandlers) {
    for (const name of Object.keys(plugin.submissionHandlers)) {
      const existingHandler = getSubmitter(name);
      const existingPlugin = registrationOwnership.submissionHandlers.get(name);
      if (existingHandler && existingPlugin && existingPlugin !== plugin.name) {
        conflicts.push({ type: 'submissionHandler', name, existingPlugin, newPlugin: plugin.name });
      }
    }
  }
  return conflicts;
}

export function registerPlugin(plugin: FormitivaPlugin, options?: PluginRegistrationOptions): void {
  const strategy = options?.conflictResolution || 'error';
  if (installedPlugins.has(plugin.name)) {
    const conflict: PluginConflict = { type: 'plugin', name: plugin.name, existingPlugin: plugin.name, newPlugin: plugin.name };
    if (!shouldRegister(conflict, strategy, options?.onConflict)) return;
  }
  const conflicts = handleConflicts(plugin);
  if (plugin.components) {
    for (const [type, component] of Object.entries(plugin.components)) {
      const conflict = conflicts.find(c => c.type === 'component' && c.name === type) ?? null;
      if (shouldRegister(conflict, strategy, options?.onConflict)) {
        registrationOwnership.components.set(type, plugin.name);
        registerComponent(type, component);
      }
    }
  }
  if (plugin.fieldCustomValidators) {
    for (const [category, validators] of Object.entries(plugin.fieldCustomValidators)) {
      for (const [name, handler] of Object.entries(validators)) {
        const conflict = conflicts.find(c => c.type === 'fieldCustomValidator' && c.name === `${category}:${name}`) ?? null;
        if (shouldRegister(conflict, strategy, options?.onConflict)) {
          const cm = registrationOwnership.fieldValidators.get(category) || new Map<string, string>();
          cm.set(name, plugin.name);
          registrationOwnership.fieldValidators.set(category, cm);
          registerFieldValidator(category, name, handler);
        }
      }
    }
  }
  if (plugin.formValidators) {
    for (const [name, handler] of Object.entries(plugin.formValidators)) {
      const conflict = conflicts.find(c => c.type === 'formValidator' && c.name === name) ?? null;
      if (shouldRegister(conflict, strategy, options?.onConflict)) {
        registrationOwnership.formValidators.set(name, plugin.name);
        registerFormValidator(name, handler);
      }
    }
  }
  if (plugin.fieldTypeValidators) {
    for (const [name, handler] of Object.entries(plugin.fieldTypeValidators)) {
      const conflict = conflicts.find(c => c.type === 'fieldTypeValidator' && c.name === `type:${name}`) ?? null;
      if (shouldRegister(conflict, strategy, options?.onConflict)) {
        registrationOwnership.fieldTypeValidators.set(name, plugin.name);
        registerTypeValidator(name, handler);
      }
    }
  }
  if (plugin.submissionHandlers) {
    for (const [name, handler] of Object.entries(plugin.submissionHandlers)) {
      const conflict = conflicts.find(c => c.type === 'submissionHandler' && c.name === name) ?? null;
      if (shouldRegister(conflict, strategy, options?.onConflict)) {
        registrationOwnership.submissionHandlers.set(name, plugin.name);
        registerSubmitter(name, handler);
      }
    }
  }
  if (plugin.setup) plugin.setup();
  installedPlugins.set(plugin.name, plugin);
}

export function unregisterPlugin(pluginName: string, removeRegistrations = false): boolean {
  const plugin = installedPlugins.get(pluginName);
  if (!plugin) return false;
  if (plugin.cleanup) plugin.cleanup();
  if (removeRegistrations) {
    if (plugin.components) { for (const key of Object.keys(plugin.components)) { registrationOwnership.components.delete(key); } }
    if (plugin.fieldCustomValidators) {
      for (const [category, validators] of Object.entries(plugin.fieldCustomValidators)) {
        const cm = registrationOwnership.fieldValidators.get(category);
        if (!cm) continue;
        for (const name of Object.keys(validators)) cm.delete(name);
        if (cm.size === 0) registrationOwnership.fieldValidators.delete(category);
      }
    }
    if (plugin.formValidators) { for (const n of Object.keys(plugin.formValidators)) registrationOwnership.formValidators.delete(n); }
    if (plugin.fieldTypeValidators) { for (const n of Object.keys(plugin.fieldTypeValidators)) registrationOwnership.fieldTypeValidators.delete(n); }
    if (plugin.submissionHandlers) { for (const n of Object.keys(plugin.submissionHandlers)) registrationOwnership.submissionHandlers.delete(n); }
  }
  installedPlugins.delete(pluginName);
  return true;
}

export function getPlugin(pluginName: string): FormitivaPlugin | undefined { return installedPlugins.get(pluginName); }
export function getAllPlugins(): FormitivaPlugin[] { return Array.from(installedPlugins.values()); }
export function hasPlugin(pluginName: string): boolean { return installedPlugins.has(pluginName); }

export function registerComponents(components: Record<string, unknown>): void {
  for (const [type, component] of Object.entries(components)) {
    registerComponent(type, component);
  }
}
