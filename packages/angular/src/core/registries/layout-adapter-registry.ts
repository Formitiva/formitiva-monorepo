import type { Type } from '@angular/core';

/**
 * A single Angular component type used as the layout adapter.
 * The component receives `config`, `activeSection`, `onSectionChange`, and `t`
 * as inputs (via ngComponentOutlet) and is responsible for rendering the
 * appropriate layout chrome based on `config.type`.
 *
 * This mirrors the React / Vue / Vanilla single-adapter pattern so that
 * custom adapters can support any layout type without changes to the renderer.
 */
export type AngularLayoutAdapter = Type<unknown>;

let _adapter: AngularLayoutAdapter | null = null;

export function registerLayoutAdapter(adapter: AngularLayoutAdapter): void {
  _adapter = adapter;
}

export function getLayoutAdapter(): AngularLayoutAdapter | null {
  return _adapter;
}

export function clearLayoutAdapter(): void {
  _adapter = null;
}
