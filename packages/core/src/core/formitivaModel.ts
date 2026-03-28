import type { FormitivaDefinition, FormitivaInstance, DefinitionPropertyField } from './formitivaTypes';

export interface LoadDefinitionOptions {
  validateSchema?: boolean;
}

export interface DefinitionLoadResult {
  success: boolean;
  definition?: FormitivaDefinition;
  error?: string;
}

export interface InstanceLoadResult {
  success: boolean;
  instance?: FormitivaInstance;
  error?: string;
}

/** Validates that a definition object has the required structure. */
export function validateDefinitionSchema(definition: FormitivaDefinition): string | null {
  if (!definition || typeof definition !== 'object') {
    return 'Definition must be an object';
  }
  if (!definition.name || typeof definition.name !== 'string') {
    return "Definition must include a 'name' string";
  }
  if (definition.name.trim() === '') {
    return "Definition 'name' cannot be empty";
  }
  if (!definition.version || typeof definition.version !== 'string') {
    return "Definition must include a 'version' string";
  }
  if (definition.properties !== undefined && !Array.isArray(definition.properties)) {
    return "'properties' must be an array if provided";
  }
  if (Array.isArray(definition.properties)) {
    for (let i = 0; i < definition.properties.length; i++) {
      const p = definition.properties[i];
      if (!p || typeof p !== 'object') return `Property at index ${i} must be an object`;
      if (!p.name || typeof p.name !== 'string') return `Property at index ${i} must have a string 'name'`;
      if (p.name.trim() === '') return `Property at index ${i} has an empty 'name'`;
      if (!p.type || typeof p.type !== 'string') return `Property '${p.name}' must have a string 'type'`;
      if (p.type.trim() === '') return `Property '${p.name}' has an empty 'type'`;
    }
  }
  return null;
}

/** Load a definition from a JSON string. Does not perform any file I/O. */
export async function loadJsonDefinition(
  jsonData: string,
  options: LoadDefinitionOptions = {},
): Promise<DefinitionLoadResult> {
  const { validateSchema = true } = options;
  try {
    if (!jsonData || typeof jsonData !== 'string') {
      return { success: false, error: 'jsonData must be a non-empty JSON string' };
    }
    const text = jsonData.trim();
    if (!text) return { success: false, error: 'jsonData is empty' };

    let definition: FormitivaDefinition;
    try {
      definition = JSON.parse(text) as unknown as FormitivaDefinition;
    } catch (parseError) {
      return {
        success: false,
        error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
      };
    }

    if (validateSchema) {
      const validationError = validateDefinitionSchema(definition);
      if (validationError) {
        return { success: false, error: `Schema validation failed: ${validationError}` };
      }
    }

    return { success: true, definition: definition as FormitivaDefinition };
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error loading definition: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/** Create a new FormitivaInstance from a definition with default values. */
export function createInstanceFromDefinition(
  definition: FormitivaDefinition,
  name: string,
): InstanceLoadResult {
  try {
    if (!definition) return { success: false, error: 'Definition is required' };
    if (!name || typeof name !== 'string') return { success: false, error: 'Instance name is required' };

    const instance: FormitivaInstance = {
      name,
      definition: definition.name ?? 'unknown',
      version: definition.version ?? '1.0.0',
      values: {},
    };

    const properties = definition.properties || [];
    if (Array.isArray(properties)) {
      (properties as unknown[]).forEach((prop) => {
        const p = prop as Record<string, unknown>;
        if (p['type'] === 'unit') {
          const defaultUnit = p['defaultUnit'] as string;
          const defaultValue = Number(p['defaultValue']) || 0;
          (instance.values as Record<string, unknown>)[p['name'] as string] = [defaultValue, defaultUnit || 'm'];
        } else {
          if (p['defaultValue'] !== undefined) {
            (instance.values as Record<string, unknown>)[p['name'] as string] = p['defaultValue'];
          }
        }
      });
    }

    return { success: true, instance };
  } catch (error) {
    return {
      success: false,
      error: `Error creating instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/** Load and validate an instance from a JSON string or plain object. */
export function loadInstance(instanceData: string | Record<string, unknown>): InstanceLoadResult {
  try {
    if (!instanceData) return { success: false, error: 'Instance data is required' };

    let instance: FormitivaInstance;
    if (typeof instanceData === 'string') {
      try {
        instance = JSON.parse(instanceData);
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`,
        };
      }
    } else {
      instance = instanceData as unknown as FormitivaInstance;
    }

    if (typeof instance !== 'object' || instance === null) {
      return { success: false, error: 'Instance must be a valid object' };
    }

    return { success: true, instance };
  } catch (error) {
    return {
      success: false,
      error: `Error loading instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Upgrade an existing instance to match the latest definition,
 * preserving compatible values and filling in new defaults.
 */
export function upgradeInstanceToLatestDefinition(
  oldInstance: FormitivaInstance,
  latestDefinition: FormitivaDefinition,
  callback?: (
    oldInstance: FormitivaInstance,
    newInstance: Record<string, unknown>,
    latestDefinition: FormitivaDefinition,
  ) => void,
): InstanceLoadResult {
  try {
    if (!oldInstance) return { success: false, error: 'Instance is required' };
    if (!latestDefinition) return { success: false, error: 'Latest definition is required' };

    if (
      oldInstance.definition === latestDefinition.name &&
      oldInstance.version === latestDefinition.version
    ) {
      return { success: true, instance: oldInstance };
    }

    const newInstance: Record<string, unknown> = {
      name: oldInstance.name || latestDefinition.name + '-instance',
      definition: latestDefinition.name,
      version: latestDefinition.version,
      values: {},
    };

    const newValues = newInstance['values'] as Record<string, unknown>;

    const latestPropMap: Record<string, DefinitionPropertyField> = {};
    (latestDefinition.properties || []).forEach((p) => {
      latestPropMap[p.name] = p;
    });

    const convertValue = (value: unknown, targetType: string, prop?: DefinitionPropertyField): unknown => {
      if (value === null || value === undefined) return value;
      const t = targetType.toLowerCase();
      try {
        if (t === 'string' || t === 'text') return String(value);
        if (['int', 'integer', 'number', 'float'].includes(t)) {
          if (typeof value === 'number') return value;
          if (typeof value === 'boolean') return value ? 1 : 0;
          if (typeof value === 'string') {
            const n = Number(value.trim());
            return Number.isNaN(n) ? 0 : n;
          }
          return 0;
        }
        if (['boolean', 'bool', 'checkbox', 'switch'].includes(t)) {
          if (typeof value === 'boolean') return value;
          if (typeof value === 'number') return value !== 0;
          if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase().trim());
          return Boolean(value);
        }
        if (t === 'unit') {
          if (Array.isArray(value) && value.length >= 2) return value;
          const fallbackUnit = prop?.defaultUnit || 'm';
          if (typeof value === 'number') return [value, fallbackUnit];
          return [0, fallbackUnit];
        }
        if (t.endsWith('[]') || ['array', 'int-array', 'float-array'].includes(t)) {
          if (Array.isArray(value)) return value;
          if (typeof value === 'string') return value.split(',').map((s) => s.trim()).filter(Boolean);
          return [value];
        }
      } catch {
        // fallthrough
      }
      return value;
    };

    const oldValues = (oldInstance.values || {}) as Record<string, unknown>;
    Object.keys(oldValues).forEach((key) => {
      const latestProp = latestPropMap[key];
      if (!latestProp) return; // property removed
      const oldVal = oldValues[key];
      const newType = (latestProp.type || '').toLowerCase();
      const oldType = Array.isArray(oldVal) ? 'array' : typeof oldVal;
      if (oldType === newType || (newType === 'string' && typeof oldVal === 'string')) {
        newValues[key] = oldVal;
      } else {
        newValues[key] = convertValue(oldVal, newType, latestProp);
      }
    });

    (latestDefinition.properties || []).forEach((prop) => {
      if (!(prop.name in newValues)) {
        newValues[prop.name] = prop.defaultValue;
      }
    });

    try {
      callback?.(oldInstance, newInstance, latestDefinition);
    } catch (cbErr) {
      return {
        success: false,
        error: `Upgrade callback error: ${cbErr instanceof Error ? cbErr.message : String(cbErr)}`,
      };
    }

    return { success: true, instance: newInstance as unknown as FormitivaInstance };
  } catch (error) {
    return {
      success: false,
      error: `Error upgrading instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
