import type { LayoutConfig } from '@formitiva/core';

/**
 * The result returned by a Vanilla layout adapter factory.
 * el:        the root DOM element of the layout chrome (nav panel / tab bar / wizard).
 * contentEl: the element where the renderer mounts field widgets.
 * isLastStep?: for wizard adapters, returns whether the current step is the last one.
 * destroy():  clean up DOM listeners.
 */
export interface VanillaLayoutAdapterResult {
  el: HTMLElement;
  contentEl: HTMLElement;
  /** Optional slot (left of wizard nav row) where the renderer injects the submit button. */
  submitSlot?: HTMLElement;
  /** Optional hook for wizard adapters to enable/disable the Next button. */
  setNextDisabled?(disabled: boolean): void;
  isLastStep?(): boolean;
  destroy(): void;
}

/**
 * Factory function registered by the pro package.
 * The renderer calls it when a LayoutConfig is active.
 */
export type VanillaLayoutAdapter = (
  config: LayoutConfig,
  initialSection: string,
  onSectionChange: (name: string) => void,
  t: (key: string) => string,
) => VanillaLayoutAdapterResult;

let _adapter: VanillaLayoutAdapter | null = null;

export function registerLayoutAdapter(adapter: VanillaLayoutAdapter): void {
  _adapter = adapter;
}

export function getLayoutAdapter(): VanillaLayoutAdapter | null {
  return _adapter;
}

export function clearLayoutAdapter(): void {
  _adapter = null;
}
