import type { LayoutConfig } from '@formitiva/core';
import type { VanillaLayoutAdapterResult } from '../../core/registries/layoutAdapterRegistry';
import { createNavLayout } from './NavLayout';
import { createTabLayout } from './TabLayout';
import { createWizardLayout } from './WizardLayout';

export function vanillaLayoutAdapter(
  config: LayoutConfig,
  initialSection: string,
  onSectionChange: (name: string) => void,
  t: (key: string) => string,
): VanillaLayoutAdapterResult {
  if (config.type === 'nav') {
    const result = createNavLayout(config, initialSection, onSectionChange);
    return { el: result.el, contentEl: result.contentEl, destroy: result.destroy };
  }
  if (config.type === 'tab') {
    const result = createTabLayout(config, initialSection, onSectionChange);
    return { el: result.el, contentEl: result.contentEl, destroy: result.destroy };
  }
  if (config.type === 'wizard') {
    const result = createWizardLayout(config, initialSection, onSectionChange, t);
    return { el: result.el, contentEl: result.contentEl, submitSlot: result.submitSlot, setNextDisabled: result.setNextDisabled, isLastStep: result.isLastStep, destroy: result.destroy };
  }
  const el = document.createElement('div');
  const contentEl = document.createElement('div');
  el.appendChild(contentEl);
  return { el, contentEl, destroy: () => el.remove() };
}
