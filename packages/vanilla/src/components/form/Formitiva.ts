/**
 * Formitiva - Main vanilla JS form class.
 * Replaces the React Formitiva component + FormitivaProvider + FormitivaRenderer.
 */
import '@formitiva/core/styles/formitiva.css';
import FormitivaCss from '@formitiva/core/styles/formitiva.css?raw';
import type { FormitivaDefinition, FormitivaProps, FormitivaInstance, FieldValueType } from '@formitiva/core';
import type { FormContext } from '../../context/formitivaContext';
import {
  loadTranslationMaps,
  createTranslationFunction,
  buildFormStyle,
  buildFieldStyle,
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
    } catch (err) {
      console.error('Formitiva: Invalid form definition JSON:', err instanceof Error ? err.message : String(err));
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
    const { commonMap, userMap } = await loadTranslationMaps(language, localizeName);
    const translationFn = createTranslationFunction(language, commonMap, userMap);
    const theme = this.props.theme || 'light';
    const ctx: FormContext = {
      definitionName: this.definition.name,
      language,
      theme,
      formStyle: buildFormStyle(),
      fieldStyle: buildFieldStyle(),
      t: translationFn,
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
