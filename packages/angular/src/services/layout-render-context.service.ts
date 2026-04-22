import { Injectable, signal } from '@angular/core';
import type { DefinitionPropertyField, FieldValueType, ErrorType, TranslationFunction } from '@formitiva/core';

export interface LayoutVisibleGroup {
  name: string | undefined;
  fields: DefinitionPropertyField[];
}

/**
 * Provided at FormitivaRendererComponent level so that pro layout
 * components (NavLayoutProComponent, TabLayoutProComponent,
 * WizardLayoutProComponent) can inject it and render field content
 * without needing direct template access to the renderer's view.
 *
 * The renderer populates this service whenever a layout adapter is active.
 */
@Injectable()
export class LayoutRenderContextService {
  readonly visibleGroups = signal<LayoutVisibleGroup[]>([]);
  readonly valuesMap = signal<Record<string, FieldValueType>>({});
  readonly errors = signal<Record<string, string>>({});
  readonly disabledByRef = signal<Record<string, boolean>>({});
  readonly isApplyDisabled = signal(false);
  readonly isWizardLastStep = signal(false);
  /** Reactive translation function — updated by FormitivaRendererComponent whenever language changes. */
  readonly t = signal<TranslationFunction>((k) => k);

  handleChange: (name: string, value: FieldValueType) => void = () => {};
  handleError: (name: string, error: ErrorType) => void = () => {};
  handleSubmit: () => void = () => {};
  setSectionFn: (name: string) => void = () => {};
}
