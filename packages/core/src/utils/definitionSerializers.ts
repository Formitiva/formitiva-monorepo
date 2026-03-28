import type { FormitivaDefinition, DefinitionPropertyField } from "../core/formitivaTypes";

// --- Runtime type guards ---
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isDefinitionPropertyField(obj: unknown): obj is DefinitionPropertyField {
  if (!isObject(obj)) return false;
  const o = obj as Record<string, unknown>;
  return typeof o["name"] === "string" && typeof o["displayName"] === "string";
}

export function isFormitivaDefinition(obj: unknown): obj is FormitivaDefinition {
  if (!isObject(obj)) return false;
  const o = obj as Record<string, unknown>;
  if (typeof o["name"] !== "string") return false;
  if (typeof o["version"] !== "string") return false;
  if (!Array.isArray(o["properties"])) return false;
  return (o["properties"] as unknown[]).every((p: unknown) => isDefinitionPropertyField(p));
}

function isFile(v: unknown): v is File {
  try {
    return typeof File !== "undefined" && v instanceof File;
  } catch {
    // In some test environments File may be undefined
    const o = isObject(v) ? (v as Record<string, unknown>) : undefined;
    return !!o && typeof o["name"] === "string" && typeof o["size"] === "number";
  }
}

/**
 * Enhanced serialization options for better control over the process
 */
export interface SerializationOptions {
  includeMetadata?: boolean;
  dateFormat?: 'iso' | 'timestamp' | 'locale';
  fileHandling?: 'metadata' | 'skip' | 'base64';
  prettify?: boolean;
  excludeFields?: string[];
  includeOnlyFields?: string[];
}

/**
 * Enhanced deserialization options
 */
export interface DeserializationOptions {
  strict?: boolean;
  validateTypes?: boolean;
  preserveUnknownFields?: boolean;
  dateFormat?: 'auto' | 'iso' | 'timestamp';
}

/**
 * Serialization result with metadata
 */
export interface SerializationResult {
  success: boolean;
  data?: string;
  error?: string;
  metadata?: {
    fieldCount: number;
    excludedFields: string[];
    warnings: string[];
  };
}

/**
 * Deserialization result with validation info
 */
export interface DeserializationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  validationErrors?: string[];
}

/**
 * Enhanced instance serialization with comprehensive options and error handling
 */
export function serializeInstance(
  instance: Record<string, unknown>,
  definition?: FormitivaDefinition | Record<string, unknown>,
  options: SerializationOptions = {}
): SerializationResult {
  try {
    const {
      includeMetadata = false,
      dateFormat = 'iso',
      fileHandling = 'metadata',
      prettify = false,
      excludeFields = [],
      includeOnlyFields = []
    } = options;

    if (!instance || typeof instance !== 'object') {
      return {
        success: false,
        error: 'Instance must be a valid object'
      };
    }

    const warnings: string[] = [];
    const excludedFieldsList: string[] = [];
    const props: Record<string, unknown> = {};
    
    // Get definition properties if available
    const rawProps: unknown[] = isFormitivaDefinition(definition)
      ? definition.properties
      : (isObject(definition) && Array.isArray((definition as Record<string, unknown>)["properties"]) ? ((definition as Record<string, unknown>)["properties"] as unknown[]) : []);

    const defProps: DefinitionPropertyField[] = rawProps.filter(isDefinitionPropertyField) as DefinitionPropertyField[];

    // Create a map for faster property lookup
    const propMap = new Map(defProps.map((p) => [p.name, p]));

    // Process each field in the instance
    for (const [fieldName, value] of Object.entries(instance)) {
      // Skip if excluded
      if (excludeFields.includes(fieldName)) {
        excludedFieldsList.push(fieldName);
        continue;
      }
      
      // Skip if not in include list (when specified)
      if (includeOnlyFields.length > 0 && !includeOnlyFields.includes(fieldName)) {
        excludedFieldsList.push(fieldName);
        continue;
      }
      
      if (value === undefined) continue;

      const fieldDef = propMap.get(fieldName);
      
      try {
        // Handle serialization based on field type
        props[fieldName] = serializeFieldValue(value, fieldDef, { dateFormat, fileHandling });
      } catch (error) {
        warnings.push(`Error serializing field '${fieldName}': ${String(error)}`);
        props[fieldName] = null;
      }
    }

    // Include metadata if requested
    if (includeMetadata) {
      (props as Record<string, unknown>)["_metadata"] = {
        serializedAt: new Date().toISOString(),
        version: (isObject(definition) ? (definition as Record<string, unknown>)["version"] : undefined) || "1.0.0",
        fieldCount: Object.keys(props).length - 1, // Exclude metadata itself
      };
    }

    const jsonString = prettify ? JSON.stringify(props, null, 2) : JSON.stringify(props);
    
    return {
      success: true,
      data: jsonString,
      metadata: {
        fieldCount: Object.keys(props).length,
        excludedFields: excludedFieldsList,
        warnings
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Serialize individual field value based on its type
 */
function serializeFieldValue(
  value: unknown,
  fieldDef?: DefinitionPropertyField,
  options: Pick<SerializationOptions, "dateFormat" | "fileHandling"> = {}
): unknown {
  const { dateFormat = 'iso', fileHandling = 'metadata' } = options;

  if (value === null || value === undefined) {
    return null;
  }

  // Handle based on field type if available
  if (fieldDef) {
    switch (fieldDef.type) {
      case 'date':
      case 'datetime':
      case 'date-time':
        return serializeDateValue(value, dateFormat);
        
      case 'file':
        return serializeFileValue(value, fileHandling);
        
      case 'int':
      case 'integer':
        return typeof value === 'string' ? parseInt(value, 10) : value;
        
      case 'float':
      case 'number':
        return typeof value === 'string' ? parseFloat(value) : value;
        
      case 'boolean':
        return typeof value === 'string' ? value === 'true' : Boolean(value);
        
      case 'int-array':
      case 'float-array':
        if (Array.isArray(value)) {
          return value.map((v) => (typeof v === 'string' ? Number(v) : v));
        }
        return value;
        
      default:
        return value;
    }
  }

  // Auto-detect and handle special types
  if (value instanceof Date) {
    return serializeDateValue(value, dateFormat);
  }

  if (isFile(value) || (Array.isArray(value) && isFile((value as unknown[])[0]))) {
    return serializeFileValue(value, fileHandling);
  }

  return value;
}

/**
 * Serialize date values according to format preference
 */
function serializeDateValue(value: unknown, format: 'iso' | 'timestamp' | 'locale'): unknown {
  let date: Date | null = null;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      date = parsed;
    } else {
      return value; // Return as-is if not parseable
    }
  } else {
    return value;
  }

  switch (format) {
    case 'timestamp':
      return date.getTime();
    case 'locale':
      return date.toLocaleString();
    case 'iso':
    default:
      return date.toISOString();
  }
}

/**
 * Serialize file values according to handling preference
 */
function serializeFileValue(value: unknown, handling: 'metadata' | 'skip' | 'base64'): unknown {
  if (handling === 'skip') {
    return null;
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((file) => serializeSingleFile(file, handling));
  }

  return serializeSingleFile(value, handling);
}

/**
 * Serialize a single file
 */
function serializeSingleFile(file: unknown, handling: 'metadata' | 'base64'): unknown {
  if (!isFile(file)) {
    return file; // Return as-is if not a File object
  }

  const f = file as File;
  if (handling === 'metadata') {
    return {
      name: f.name,
      size: f.size,
      type: f.type,
      lastModified: f.lastModified,
    };
  }

  // base64 handling would require async, so return metadata for now
  // In a real implementation, you might want to make this async
  return {
    name: f.name,
    size: f.size,
    type: f.type,
    lastModified: f.lastModified,
    _note: 'Base64 encoding requires async implementation',
  };
}

/**
 * Enhanced instance deserialization with comprehensive validation and error handling
 */
export function deserializeInstance(
  serialized: string,
  definition?: FormitivaDefinition | Record<string, unknown>,
  options: DeserializationOptions = {}
): DeserializationResult<Record<string, unknown>> {
  try {
    const {
      strict = false,
      validateTypes = true,
      preserveUnknownFields = true,
      dateFormat = 'auto'
    } = options;

    if (!serialized || typeof serialized !== 'string') {
      return {
        success: false,
        error: 'Serialized data must be a non-empty string'
      };
    }

    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(serialized);
    } catch (parseError) {
      return {
        success: false,
        error: `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
      };
    }

    if (!obj || typeof obj !== 'object') {
      return {
        success: false,
        error: 'Parsed data must be an object'
      };
    }

    const warnings: string[] = [];
    const validationErrors: string[] = [];
    const result: Record<string, unknown> = {};
    
    // Get definition properties if available
    const rawProps: unknown[] = isFormitivaDefinition(definition)
      ? definition.properties
      : (isObject(definition) && Array.isArray((definition as Record<string, unknown>)["properties"]) ? ((definition as Record<string, unknown>)["properties"] as unknown[]) : []);

    const defProps: DefinitionPropertyField[] = rawProps.filter(isDefinitionPropertyField) as DefinitionPropertyField[];

    // Create a map for faster property lookup
    const propMap = new Map(defProps.map(p => [p.name, p]));

    // Process defined fields first
    for (const fieldDef of defProps) {
      const fieldName = fieldDef.name;
      const value = obj[fieldName];
      
      if (value === undefined) {
        // Check if field is required
        if (strict && fieldDef.required) {
          validationErrors.push(`Required field '${fieldName}' is missing`);
        }
        continue;
      }

      try {
        result[fieldName] = deserializeFieldValue(value, fieldDef, { validateTypes, dateFormat });
      } catch (error) {
        const errorMsg = `Error deserializing field '${fieldName}': ${String(error)}`;
        if (strict) {
          validationErrors.push(errorMsg);
        } else {
          warnings.push(errorMsg);
          result[fieldName] = value; // Keep original value
        }
      }
    }

    // Handle unknown fields
    if (preserveUnknownFields) {
      for (const [fieldName, value] of Object.entries(obj)) {
        if (!propMap.has(fieldName) && fieldName !== '_metadata') {
          if (strict) {
            warnings.push(`Unknown field '${fieldName}' preserved`);
          }
          result[fieldName] = value;
        }
      }
    }

    const hasErrors = validationErrors.length > 0;
    
    return {
      success: !hasErrors,
      data: result,
      warnings: warnings.length > 0 ? warnings : undefined,
      validationErrors: hasErrors ? validationErrors : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: `Deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Deserialize individual field value based on its type
 */
function deserializeFieldValue(
  value: unknown,
  fieldDef: DefinitionPropertyField,
  options: Pick<DeserializationOptions, 'validateTypes' | 'dateFormat'> = {}
): unknown {
  const { validateTypes = true, dateFormat = 'auto' } = options;

  if (value === null || value === undefined) {
    return value;
  }

  try {
    switch (fieldDef.type) {
      case 'date':
      case 'datetime':
      case 'date-time':
        return deserializeDateValue(value, dateFormat, validateTypes);
        
      case 'int':
      case 'integer':
        return deserializeIntegerValue(value, validateTypes);
        
      case 'float':
      case 'number':
        return deserializeNumberValue(value, validateTypes);
        
      case 'boolean':
        return deserializeBooleanValue(value, validateTypes);
        
      case 'int-array':
        return deserializeArrayValue(value, 'integer', validateTypes);
        
      case 'float-array':
        return deserializeArrayValue(value, 'number', validateTypes);
        
      case 'string':
      case 'text':
      case 'email':
      case 'url':
      case 'phone':
        return validateTypes ? String(value as unknown) : value;
        
      default:
        return value;
    }
  } catch (error) {
    if (validateTypes) {
      throw new Error(`Type conversion failed: ${String(error)}`);
    }
    return value;
  }
}

/**
 * Enhanced definition serialization with validation and metadata
 */
export function serializeDefinition(
  definition: FormitivaDefinition | Record<string, unknown>,
  options: SerializationOptions = {}
): SerializationResult {
  try {
    const { prettify = true, includeMetadata = true } = options;
    
    if (!definition || typeof definition !== 'object') {
      return {
        success: false,
        error: 'Definition must be a valid object'
      };
    }

    const result = { ...(definition as Record<string, unknown>) } as Record<string, unknown>;
    
    // Add metadata if requested
    if (includeMetadata) {
      (result as Record<string, unknown>)["_metadata"] = {
        serializedAt: new Date().toISOString(),
        version: (result["version"] as string) || '1.0.0',
        propertyCount: (Array.isArray(result["properties"] as unknown) ? (result["properties"] as unknown[]).length : 0) || 0,
      };
    }

    const jsonString = prettify ? JSON.stringify(result, null, 2) : JSON.stringify(result);
    
    return {
      success: true,
      data: jsonString,
      metadata: {
        fieldCount: (Array.isArray(result["properties"] as unknown) ? (result["properties"] as unknown[]).length : 0) || 0,
        excludedFields: [],
        warnings: [],
      },
    };

  } catch (error) {
    return {
      success: false,
      error: `Definition serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Enhanced definition deserialization with comprehensive validation
 */
export function deserializeDefinition(
  input: string | Record<string, unknown>,
  options: DeserializationOptions = {}
): DeserializationResult<FormitivaDefinition> {
  try {
    const { strict = false, validateTypes = true } = options;
    
    let obj: Record<string, unknown>;
    
    if (typeof input === 'string') {
      try {
        obj = JSON.parse(input);
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid JSON for definition: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`
        };
      }
      } else if (input && typeof input === 'object') {
      obj = { ...(input as Record<string, unknown>) };
    } else {
      return {
        success: false,
        error: 'Input must be a string or object'
      };
    }

    const warnings: string[] = [];
    const validationErrors: string[] = [];

    // Validate required fields
    const requiredFields = ['name', 'version', 'displayName'];
    for (const field of requiredFields) {
      if (!(field in obj) || !obj[field]) {
        if (strict) {
          validationErrors.push(`Required field '${field}' is missing`);
        } else {
          warnings.push(`Missing field '${field}', using default`);
          switch (field) {
            case 'name':
              obj['name'] = 'unnamed-definition';
              break;
            case 'version':
              obj['version'] = '1.0.0';
              break;
            case 'displayName':
              obj['displayName'] = obj['name'] || 'Unnamed Definition';
              break;
          }
        }
      }
    }

    // Validate and normalize properties array
    const propsArr = Array.isArray((obj as Record<string, unknown>)["properties"]) ? ((obj as Record<string, unknown>)["properties"] as unknown[]) : null;
    if (!propsArr) {
      if (strict) {
        validationErrors.push("Properties must be an array");
      } else {
        warnings.push("Properties not found or invalid, using empty array");
        (obj as Record<string, unknown>)["properties"] = [];
      }
    } else {
      // Validate each property
      (obj as Record<string, unknown>)["properties"] = propsArr.map((prop: unknown, index: number) => {
        const p = isObject(prop) ? (prop as Record<string, unknown>) : {};
        const normalized: Record<string, unknown> = { ...p };

        if (!p["name"]) {
          const error = `Property at index ${index} missing 'name'`;
          if (strict) {
            validationErrors.push(error);
          } else {
            warnings.push(`${error}, using 'field_${index}'`);
            normalized["name"] = `field_${index}`;
          }
        }

        if (!p["displayName"]) {
          normalized["displayName"] = p["name"] || `Field ${index}`;
        }

        if (!p["type"]) {
          if (strict && validateTypes) {
            validationErrors.push(`Property '${p["name"] || index}' missing 'type'`);
          } else {
            warnings.push(`Property '${p["name"] || index}' missing 'type', using 'string'`);
            normalized["type"] = 'string';
          }
        }

        if (p["defaultValue"] === undefined) {
          normalized["defaultValue"] = null;
        }

        if (p["required"] === undefined) {
          normalized["required"] = false;
        }

        return normalized;
      });
    }

    const hasErrors = validationErrors.length > 0;
    
    return {
      success: !hasErrors,
      data: obj as unknown as FormitivaDefinition,
      warnings: warnings.length > 0 ? warnings : undefined,
      validationErrors: hasErrors ? validationErrors : undefined,
    };

  } catch (error) {
    return {
      success: false,
      error: `Definition deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Deserialize date values
 */
function deserializeDateValue(value: unknown, _format: 'auto' | 'iso' | 'timestamp', validate: boolean): unknown {
  if (value instanceof Date) {
    return value;
  }
  
  if (typeof value === 'number') {
    // Treat as timestamp
    const date = new Date(value);
    if (validate && isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: ${value}`);
    }
    return date;
  }
  
  if (typeof value === 'string') {
    const date = new Date(value);
    if (validate && isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${value}`);
    }
    return date;
  }
  
  if (validate) {
    throw new Error(`Cannot convert ${typeof value} to Date`);
  }
  
  return value;
}

/**
 * Deserialize integer values
 */
function deserializeIntegerValue(value: unknown, validate: boolean): unknown {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return value;
    }
    if (validate) {
      throw new Error(`Number ${value} is not an integer`);
    }
    return Math.floor(value);
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      if (validate) {
        throw new Error('Cannot convert empty string to integer');
      }
      return value;
    }
    const parsed = parseInt(trimmed, 10);
    if (validate && isNaN(parsed)) {
      throw new Error(`Cannot convert "${value}" to integer`);
    }
    return parsed;
  }
  
  if (validate) {
    throw new Error(`Cannot convert ${typeof value} to integer`);
  }
  
  return value;
}

/**
 * Deserialize number values
 */
function deserializeNumberValue(value: unknown, validate: boolean): unknown {
  if (typeof value === 'number') {
    if (validate && !isFinite(value)) {
      throw new Error(`Number ${value} is not finite`);
    }
    return value;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      if (validate) {
        throw new Error('Cannot convert empty string to number');
      }
      return value;
    }
    const parsed = parseFloat(trimmed);
    if (validate && (isNaN(parsed) || !isFinite(parsed))) {
      throw new Error(`Cannot convert "${value}" to number`);
    }
    return parsed;
  }
  
  if (validate) {
    throw new Error(`Cannot convert ${typeof value} to number`);
  }
  
  return value;
}

/**
 * Deserialize boolean values
 */
function deserializeBooleanValue(value: unknown, validate: boolean): unknown {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1') return true;
    if (lower === 'false' || lower === '0') return false;
    
    if (validate) {
      throw new Error(`Cannot convert "${value}" to boolean`);
    }
  }
  
  if (typeof value === 'number') {
    return Boolean(value);
  }
  
  if (validate) {
    throw new Error(`Cannot convert ${typeof value} to boolean`);
  }
  
  return value;
}

/**
 * Deserialize array values
 */
function deserializeArrayValue(value: unknown, elementType: 'integer' | 'number', validate: boolean): unknown {
  if (!Array.isArray(value)) {
    // Try to split string
    if (typeof value === 'string') {
      const parts = value.split(',').map(s => s.trim()).filter(Boolean);
      return parts.map(part => {
        return elementType === 'integer' 
          ? deserializeIntegerValue(part, validate)
          : deserializeNumberValue(part, validate);
      });
    }
    
    if (validate) {
      throw new Error(`Expected array, got ${typeof value}`);
    }
    
    return value;
  }
  
  return value.map((item, index) => {
    try {
      return elementType === 'integer' 
        ? deserializeIntegerValue(item, validate)
        : deserializeNumberValue(item, validate);
    } catch (error) {
      if (validate) {
        throw new Error(`Array element ${index}: ${error}`);
      }
      return item;
    }
  });
}
