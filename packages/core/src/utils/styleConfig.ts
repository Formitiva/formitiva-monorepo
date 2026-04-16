/**
 * styleConfig.ts
 *
 * Pure style-object builders that produce the `formStyle` and `fieldStyle`
 * maps used by every framework's provider/context.
 *
 * These were previously copy-pasted (with minor differences) into:
 *   - packages/react/src/components/form/FormitivaProvider.tsx
 *   - packages/vue/src/components/form/FormitivaProvider.vue
 *   - packages/vanilla/src/components/form/Formitiva.ts
 *   - packages/angular/src/services/formitiva-context.service.ts
 */

export type StyleMap = Record<string, string | number | undefined>;

export type FormStyle = {
  container: StyleMap;
  buttonStyle: StyleMap;
  titleStyle: StyleMap;
};

export type FieldStyle = {
  container: StyleMap;
  label: StyleMap;
  input: StyleMap;
  textInput: StyleMap;
  optionInput: StyleMap;
  select: StyleMap;
  textarea: StyleMap;
  error: StyleMap;
};

const DROPDOWN_ARROW_SVG =
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' ` +
  `viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' ` +
  `stroke-linecap='round' stroke-linejoin='round'>` +
  `<polyline points='6,9 12,15 18,9'/></svg>")`;

/**
 * Builds the top-level form-container, button, and title style maps.
 */
export function buildFormStyle(style: Record<string, unknown> = {}): FormStyle {
  return {
    container: {
      padding: 'var(--formitiva-space-sm, 8px)',
      margin: '0 auto',
      backgroundColor: 'transparent',
      borderRadius: 0,
      color: 'var(--formitiva-color-text)',
      fontFamily:
        (style['fontFamily'] as string) ||
        'var(--formitiva-font-family, system-ui, -apple-system, sans-serif)',
      boxSizing: 'border-box',
      minHeight: (style['minHeight'] as string | number | undefined) ?? '0',
      ...(style['width']
        ? { width: style['width'] as string | number, overflowX: 'auto' }
        : { maxWidth: '100%' }),
      ...(style['height'] ? { height: style['height'] as string | number, overflowY: 'auto' } : {}),
    },
    buttonStyle: {
      padding: 'var(--formitiva-space-sm, 8px) var(--formitiva-space-md, 16px)',
      backgroundColor: 'var(--formitiva-color-primary)',
      color: 'var(--formitiva-color-background)',
      border: '1px solid var(--formitiva-color-primary)',
      borderRadius: 'var(--formitiva-border-radius, 6px)',
      cursor: 'pointer',
      fontSize: (style['fontSize'] as string) || '1rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--formitiva-shadow-small, 0 1px 3px rgba(0, 0, 0, 0.12))',
    },
    titleStyle: {
      marginBottom: 'var(--formitiva-space-lg, 24px)',
      color: 'var(--formitiva-color-text)',
      fontSize:
        typeof style['fontSize'] === 'number'
          ? `${(style['fontSize'] as number) * 1.5}px`
          : '1.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      textAlign: 'left',
    },
  };
}

/**
 * Builds per-field container, label, input-variant, and error style maps.
 */
export function buildFieldStyle(style: Record<string, unknown> = {}): FieldStyle {
  const baseInputStyle: StyleMap = {
    color: 'var(--formitiva-color-text)',
    fontFamily:
      (style['fontFamily'] as string) ||
      'var(--formitiva-font-family, inherit)',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  return {
    container: {
      fontFamily:
        (style['fontFamily'] as string) ||
        'var(--formitiva-font-family, inherit)',
      fontSize:
        (style['fontSize'] as string) ||
        'var(--formitiva-font-size, 1rem)',
      width: '100%',
      maxWidth: (style['width'] as string) || '100%',
      marginBottom: 'var(--formitiva-space-md, 16px)',
    },
    label: {
      display: 'block',
      marginBottom: 'var(--formitiva-space-xs, 4px)',
      fontWeight: '500',
      color: 'var(--formitiva-color-text)',
      fontSize: 'var(--formitiva-font-size, 1rem)',
      fontFamily:
        (style['fontFamily'] as string) ||
        'var(--formitiva-font-family, inherit)',
    },
    input: { ...baseInputStyle },
    textInput: { ...baseInputStyle },
    optionInput: { ...baseInputStyle },
    select: {
      ...baseInputStyle,
      cursor: 'pointer',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '16px',
      paddingRight: '32px',
      backgroundImage: DROPDOWN_ARROW_SVG,
    },
    textarea: {
      ...baseInputStyle,
      minHeight: '80px',
      resize: 'vertical',
      paddingTop: 'var(--formitiva-space-sm, 8px)',
    },
    error: {
      color: 'var(--formitiva-color-error)',
      fontSize: '0.875rem',
      marginTop: 'var(--formitiva-space-xs, 4px)',
      display: 'block',
    },
  };
}
