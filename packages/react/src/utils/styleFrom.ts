import type * as React from "react";

/**
 * Retrieves a nested CSS-properties object from a style source.
 *
 * @param source  - The top-level style object (e.g. `formStyle` or `fieldStyle`)
 * @param section - The section key inside the source (e.g. `'dropdown'`)
 * @param key     - The property key inside the section (e.g. `'control'`)
 * @returns A `React.CSSProperties` object, or `{}` if not found.
 */
export function styleFrom(
  source: unknown,
  section?: string,
  key?: string
): React.CSSProperties {
  if (!section) return {};
  const src = source as Record<string, unknown> | undefined;
  const sec = src?.[section] as Record<string, unknown> | undefined;
  const val = key && sec ? (sec[key] as React.CSSProperties | undefined) : undefined;
  return (val ?? {}) as React.CSSProperties;
}
