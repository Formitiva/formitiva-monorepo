import { Injectable, signal, computed } from '@angular/core';
import type { FieldValidationMode, TranslationFunction, FieldValueType } from '@formitiva/core';
import {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction,
  type TranslationMap,
} from '@formitiva/core';

export type FormStyle = {
  container: Record<string, string>;
  buttonStyle: Record<string, string>;
  titleStyle: Record<string, string>;
};

export type FieldStyle = {
  container: Record<string, string>;
  label: Record<string, string>;
  input: Record<string, string>;
  textInput: Record<string, string>;
  optionInput: Record<string, string>;
  select: Record<string, string>;
  textarea: Record<string, string>;
  error: Record<string, string>;
};

function buildFormStyle(style: Record<string, unknown>): FormStyle {
  return {
    container: {
      padding: 'var(--formitiva-space-sm, 8px)',
      margin: '0 auto',
      backgroundColor: 'transparent',
      borderRadius: '0',
      color: 'var(--formitiva-color-text)',
      fontFamily: (style?.['fontFamily'] as string) || 'var(--formitiva-font-family, system-ui, -apple-system, sans-serif)',
      boxSizing: 'border-box',
      minHeight: (style?.['minHeight'] as string) ?? '0',
      ...(style?.['width']
        ? { width: String(style['width']), overflowX: 'auto' }
        : { maxWidth: '100%' }),
      ...(style?.['height'] ? { height: String(style['height']), overflowY: 'auto' } : {}),
    },
    buttonStyle: {
      padding: 'var(--formitiva-space-sm, 8px) var(--formitiva-space-md, 16px)',
      backgroundColor: 'var(--formitiva-color-primary)',
      color: 'var(--formitiva-color-background)',
      border: '1px solid var(--formitiva-color-primary)',
      borderRadius: 'var(--formitiva-border-radius, 6px)',
      cursor: 'pointer',
      fontSize: (style?.['fontSize'] as string) || '1rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--formitiva-shadow-small, 0 1px 3px rgba(0, 0, 0, 0.12))',
    },
    titleStyle: {
      marginBottom: 'var(--formitiva-space-lg, 24px)',
      color: 'var(--formitiva-color-text)',
      fontSize: typeof style?.['fontSize'] === 'number' ? `${(style['fontSize'] as number) * 1.5}px` : '1.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
      textAlign: 'left',
    },
  };
}

function buildFieldStyle(style: Record<string, unknown>): FieldStyle {
  const baseInputStyle = {
    color: 'var(--formitiva-color-text)',
    fontFamily: (style?.['fontFamily'] as string) || 'var(--formitiva-font-family, inherit)',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };
  return {
    container: {
      fontFamily: (style?.['fontFamily'] as string) || 'var(--formitiva-font-family, inherit)',
      fontSize: (style?.['fontSize'] as string) || 'var(--formitiva-font-size, 1rem)',
      width: '100%',
      maxWidth: (style?.['width'] as string) || '100%',
      marginBottom: 'var(--formitiva-space-md, 16px)',
    },
    label: {
      display: 'block',
      marginBottom: 'var(--formitiva-space-xs, 4px)',
      fontWeight: '500',
      color: 'var(--formitiva-color-text)',
      fontSize: 'var(--formitiva-font-size, 1rem)',
      fontFamily: (style?.['fontFamily'] as string) || 'var(--formitiva-font-family, inherit)',
    },
    input: baseInputStyle,
    textInput: baseInputStyle,
    optionInput: baseInputStyle,
    select: {
      ...baseInputStyle,
      cursor: 'pointer',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
      backgroundSize: '16px',
      paddingRight: '32px',
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

@Injectable()
export class FormitivaContextService {
  readonly definitionName = signal<string>('');
  readonly language = signal<string>('en');
  readonly theme = signal<string>('light');
  readonly fieldValidationMode = signal<FieldValidationMode>('onEdit');
  readonly displayInstanceName = signal<boolean>(true);
  readonly localizeName = signal<string>('');
  /** Live form values — updated by FormitivaRendererComponent so ButtonHandlers can read them. */
  readonly valuesMap = signal<Record<string, FieldValueType>>({});

  private readonly defaultStyle = signal<Record<string, unknown>>({});
  private readonly commonMap = signal<TranslationMap>({});
  private readonly userMap = signal<TranslationMap>({});

  readonly formStyle = computed<FormStyle>(() => buildFormStyle(this.defaultStyle()));
  readonly fieldStyle = computed<FieldStyle>(() => buildFieldStyle(this.defaultStyle()));

  readonly t = computed<TranslationFunction>(() =>
    createTranslationFunction(this.language(), this.commonMap(), this.userMap())
  );

  private abortController: AbortController | null = null;

  configure(opts: {
    definitionName?: string;
    language?: string;
    theme?: string;
    fieldValidationMode?: FieldValidationMode;
    displayInstanceName?: boolean;
    defaultStyle?: Record<string, unknown>;
    localizeName?: string;
  }): void {
    if (opts.definitionName !== undefined) this.definitionName.set(opts.definitionName);
    if (opts.theme !== undefined) this.theme.set(opts.theme);
    if (opts.fieldValidationMode !== undefined) this.fieldValidationMode.set(opts.fieldValidationMode);
    if (opts.displayInstanceName !== undefined) this.displayInstanceName.set(opts.displayInstanceName);
    if (opts.defaultStyle !== undefined) this.defaultStyle.set(opts.defaultStyle);
    if (opts.localizeName !== undefined) this.localizeName.set(opts.localizeName);

    if (opts.language !== undefined && opts.language !== this.language()) {
      this.language.set(opts.language);
      this.loadTranslations(opts.language, opts.localizeName ?? this.localizeName());
    }
  }

  private async loadTranslations(lang: string, localize: string): Promise<void> {
    this.abortController?.abort();
    const ac = new AbortController();
    this.abortController = ac;

    if (lang === 'en') {
      this.commonMap.set({});
      this.userMap.set({});
      return;
    }

    try {
      const common = await loadCommonTranslation(lang);
      if (ac.signal.aborted) return;
      this.commonMap.set(common.success ? common.translations : {});

      const user = await loadUserTranslation(lang, localize);
      if (ac.signal.aborted) return;
      this.userMap.set(user.success ? user.translations : {});
    } catch {
      if (!ac.signal.aborted) {
        this.commonMap.set({});
        this.userMap.set({});
      }
    }
  }
}
