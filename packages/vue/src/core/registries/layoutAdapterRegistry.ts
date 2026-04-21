import type { Component } from 'vue';

/**
 * A Vue component used as the pro layout adapter.
 * Required props:  layout, modelValue (activeSection).
 * Emits:          update:modelValue (section name).
 * Slots:          default (filtered fields), submit (submit button).
 *
 * The adapter renders the layout chrome (nav panel / tab bar / wizard
 * step indicators + Prev/Next) and delegates field + submit rendering
 * to the parent via slots.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VueLayoutAdapter = Component;

let _adapter: VueLayoutAdapter | null = null;

export function registerLayoutAdapter(adapter: VueLayoutAdapter): void {
  _adapter = adapter;
}

export function getLayoutAdapter(): VueLayoutAdapter | null {
  return _adapter;
}

export function clearLayoutAdapter(): void {
  _adapter = null;
}
