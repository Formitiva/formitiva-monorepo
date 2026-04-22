import { Injectable, signal, computed, type OnDestroy } from '@angular/core';
import type { FieldValidationMode, TranslationFunction, FieldValueType } from '@formitiva/core';
import {
  loadTranslationMaps,
  createTranslationFunction,
  buildFormStyle,
  buildFieldStyle,
  type FormStyle,
  type FieldStyle,
  type TranslationMap,
} from '@formitiva/core';

export type { FormStyle, FieldStyle };

@Injectable()
export class FormitivaContextService implements OnDestroy {
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

    const { commonMap, userMap } = await loadTranslationMaps(lang, localize);
    if (ac.signal.aborted) return;
    this.commonMap.set(commonMap);
    this.userMap.set(userMap);
  }

  ngOnDestroy(): void {
    this.abortController?.abort();
  }
}
