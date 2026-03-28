/**
 * Formitiva - Main vanilla JS form class.
 * Replaces the React Formitiva component + FormitivaProvider + FormitivaRenderer.
 */
import '@formitiva/core/styles/formitiva.css';
import FormitivaCss from '@formitiva/core/styles/formitiva.css?raw';
import type { FormitivaDefinition, FormitivaProps, FormitivaInstance, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import {
  loadCommonTranslation,
  loadUserTranslation,
  createTranslationFunction,
  type TranslationMap,
} from '@formitiva/core';
import { registerBaseComponents } from '../../core/registries/componentRegistry';
import { ensureBuiltinFieldTypeValidatorsRegistered } from '@formitiva/core';
import { createFormitivaRenderer, type FormitivaRendererResult } from './FormitivaRenderer';
import { createInstanceFromDefinition } from '@formitiva/core';

// Inject formitiva styles once
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('formitiva-styles')) return;
  try {
    const style = document.createElement('style');
    style.id = 'formitiva-styles';
    style.textContent = FormitivaCss as string;
    document.head.appendChild(style);
  } catch { /* ignore */ }
}

// Ensure popup-root exists
function ensurePopupRoot() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('popup-root')) {
    const root = document.createElement('div');
    root.id = 'popup-root';
    document.body.appendChild(root);
  }
}

// Style generation (mirrors FormitivaProvider logic)
function getFormStyle(style: Record<string, unknown>): Record<string, Record<string, unknown>> {
  return {
    container: {
      padding: 'var(--formitiva-space-sm, 8px)', margin: '0 auto',
      backgroundColor: 'transparent', borderRadius: 0,
      color: 'var(--formitiva-color-text)',
      fontFamily: style?.fontFamily as string || 'var(--formitiva-font-family, system-ui, -apple-system, sans-serif)',
      boxSizing: 'border-box',
      minHeight: style?.minHeight ?? '0',
      ...(style?.width ? { width: style.width, overflowX: 'auto' } : { maxWidth: '100%' }),
      ...(style?.height ? { height: style.height, overflowY: 'auto' } : {}),
    },
    buttonStyle: {
      padding: 'var(--formitiva-space-sm, 8px) var(--formitiva-space-md, 16px)',
      backgroundColor: 'var(--formitiva-color-primary)', color: 'var(--formitiva-color-background)',
      border: '1px solid var(--formitiva-color-primary)',
      borderRadius: 'var(--formitiva-border-radius, 6px)', cursor: 'pointer',
      fontSize: style?.fontSize as string || '1rem', fontWeight: '600',
      transition: 'all 0.2s ease',
      boxShadow: 'var(--formitiva-shadow-small, 0 1px 3px rgba(0,0,0,0.12))',
    },
    titleStyle: {
      marginBottom: 'var(--formitiva-space-lg, 24px)', color: 'var(--formitiva-color-text)',
      fontSize: typeof style?.fontSize === 'number' ? `${(style.fontSize as number) * 1.5}px` : '1.5rem',
      fontWeight: '700', lineHeight: '1.2', textAlign: 'left',
    },
  };
}

function getFieldStyle(style: Record<string, unknown>): Record<string, Record<string, unknown>> {
  const base = {
    color: 'var(--formitiva-color-text)',
    fontFamily: (style?.fontFamily as string) || 'var(--formitiva-font-family, inherit)',
    transition: 'all 0.2s ease', outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  return {
    container: { fontFamily: style?.fontFamily || 'var(--formitiva-font-family, inherit)', fontSize: style?.fontSize || 'var(--formitiva-font-size, 1rem)', width: '100%', maxWidth: style?.width || '100%', marginBottom: 'var(--formitiva-space-md, 16px)' },
    label: { display: 'block', marginBottom: 'var(--formitiva-space-xs, 4px)', fontWeight: '500', color: 'var(--formitiva-color-text)', fontSize: 'var(--formitiva-font-size, 1rem)', fontFamily: style?.fontFamily || 'var(--formitiva-font-family, inherit)' },
    input: base, textInput: base, optionInput: base,
    error: { color: 'var(--formitiva-color-error)', fontSize: '0.875rem', marginTop: 'var(--formitiva-space-xs, 4px)', display: 'block' },
  };
}

function detectTheme(container: HTMLElement): string {
  const themed = container.closest('[data-formitiva-theme]');
  return themed?.getAttribute('data-formitiva-theme') || 'light';
}

export class Formitiva {
  private props: FormitivaProps;
  private definition: FormitivaDefinition | null = null;
  private instance: FormitivaInstance | null = null;
  private renderer: FormitivaRendererResult | null = null;
  private wrapper: HTMLElement | null = null;

  constructor(props: FormitivaProps) {
    this.props = props;
    injectStyles();
    ensurePopupRoot();
    registerBaseComponents();
    ensureBuiltinFieldTypeValidatorsRegistered();

    // Parse definition
    try {
      this.definition = typeof props.definitionData === 'string'
        ? JSON.parse(props.definitionData)
        : (props.definitionData ?? null) as FormitivaDefinition | null;
    } catch {
      this.definition = null;
    }
  }

  async mount(container: HTMLElement): Promise<void> {
    if (!this.definition) {
      const err = document.createElement('div');
      err.style.color = 'red';
      err.textContent = 'Error: No form definition provided.';
      container.appendChild(err);
      return;
    }

    // Resolve instance
    this.instance = this.props.instance ?? null;
    if (!this.instance) {
      const result = createInstanceFromDefinition(this.definition, this.definition.name);
      if (!result.success || !result.instance) {
        const err = document.createElement('div');
        err.style.color = 'red';
        err.textContent = 'Error: Failed to create instance from definition.';
        container.appendChild(err);
        return;
      }
      this.instance = result.instance;
    }

    // Load translations
    const language = this.props.language || 'en';
    const localizeName = this.definition.localization || '';
    let commonMap: TranslationMap = {};
    let userMap: TranslationMap = {};
    if (language !== 'en') {
      try {
        const cr = await loadCommonTranslation(language);
        commonMap = cr.success ? cr.translations : {};
        const ur = await loadUserTranslation(language, localizeName);
        userMap = ur.success ? ur.translations : {};
      } catch { /* fail silently */ }
    }

    const translationFn = createTranslationFunction(language, commonMap, userMap);
    const style = { ...this.props.style } as Record<string, unknown>;
    const theme = this.props.theme || detectTheme(container) || 'light';

    const ctx: FormContext = {
      definitionName: this.definition.name,
      language,
      theme,
      formStyle: getFormStyle(style),
      fieldStyle: getFieldStyle(style),
      t: (text, ...args) => translationFn(text, ...args),
      fieldValidationMode: this.props.fieldValidationMode || 'onEdit',
      displayInstanceName: this.props.displayInstanceName ?? true,
    };

    // Create wrapper with theme attribute
    this.wrapper = document.createElement('div');
    this.wrapper.setAttribute('data-formitiva-theme', theme);
    this.wrapper.className = this.props.className || 'formitiva-container';
    if (this.props.style?.height) this.wrapper.style.height = '100%';

    this.renderer = createFormitivaRenderer({
      definition: this.definition,
      instance: this.instance,
      ctx,
      onSubmit: this.props.onSubmit,
      onValidation: this.props.onValidation,
    });

    this.wrapper.appendChild(this.renderer.el);
    container.appendChild(this.wrapper);
  }

  unmount(): void {
    if (this.renderer) { this.renderer.destroy(); this.renderer = null; }
    if (this.wrapper) { this.wrapper.remove(); this.wrapper = null; }
  }

  getValues(): Record<string, FieldValueType> {
    return this.renderer?.getValues() ?? {};
  }

  validate(): boolean {
    return this.renderer?.validate() ?? false;
  }

  destroy(): void {
    this.unmount();
  }
}

export default Formitiva;
