import type { DefinitionPropertyField, FieldValueType, TranslationFunction } from "../../core/formitivaTypes";

// Simple URL validation (accepts http(s), ftp, file, etc.)
const urlRegex =
  /^(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|]$/i;

// Alternative: also validate via URL constructor for stricter checks
const isValidUrl = (s: string): boolean => {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
};

export function validateUrlField(
  field: DefinitionPropertyField,
  input: FieldValueType,
  t: TranslationFunction
): string | undefined {
  const trimmed = String(input ?? "").trim();

  if (trimmed === "") {
    return field.required ? t("Value required") : undefined;
  }

  // Absolute URL
  if (urlRegex.test(trimmed) || isValidUrl(trimmed)) {
    return undefined;
  }

  // Relative URL (only if allowed)
  if (field.allowRelative === true) {
    if (!trimmed.startsWith("/")) {
      return t("Must be a valid URL");
    }
    
    // Reject characters that must be percent-encoded
    if (encodeURI(trimmed) !== trimmed) {
      return t("Must be a valid URL");
    }

    try {
      new URL(trimmed, "http://example.com");
      return undefined;
    } catch {
      return t("Must be a valid URL");
    }
  }

  return t("Must be a valid URL");
}
