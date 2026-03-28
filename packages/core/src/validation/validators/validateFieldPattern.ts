import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

// Cache compiled RegExp objects per field to avoid re-compiling on every validation
const patternRegexCache: WeakMap<DefinitionPropertyField, { pattern?: string; regex: RegExp | null }> = new WeakMap();

export function validateFieldPattern(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction,
  fallbackMessage?: string,
  ...args: unknown[]
): string | undefined {
  if (field.pattern == null) {
    return undefined;
  }
  const inputStr = String(input);

  // Compile / reuse regex for this field when a pattern is provided
  let patternRegex: RegExp | null = null;
  if (field.pattern) {
    const cached = patternRegexCache.get(field);
    if (cached && cached.pattern === field.pattern) {
      patternRegex = cached.regex;
    } else {
      try {
        const r = new RegExp(field.pattern);
        patternRegexCache.set(field, { pattern: field.pattern, regex: r });
        patternRegex = r;
      } catch (err) {
        // If the pattern is invalid, cache a null to avoid repeated throws
        void err; // avoid unused variable lint
        patternRegexCache.set(field, { pattern: field.pattern, regex: null });
        patternRegex = null;
      }
    }
  }

  if (patternRegex && !patternRegex.test(inputStr)) {
    if (field.patternErrorMessage) {
      return t(field.patternErrorMessage);
    } else {
      return fallbackMessage ? t(fallbackMessage, ...args) : t("Input does not match pattern: {{1}}", field.pattern);
    }
  }

  return undefined;
}

export default validateFieldPattern;
