import type * as React from 'react';
import type { LayoutConfig } from '@formitiva/core';

/**
 * Props passed by FormitivaRenderer to the pro layout adapter.
 * The adapter manages active-section state internally and uses
 * renderFields / renderSubmit to populate the layout chrome.
 */
export interface ReactLayoutAdapterProps {
  layout: LayoutConfig;
  /** Render the fields for a given section (undefined = all fields). */
  renderFields: (fieldNames?: string[]) => React.ReactNode;
  /** Render the submit button (adapter decides when to show it). */
  renderSubmit: () => React.ReactNode;
  /** Check whether a given set of fields currently has validation errors. */
  hasErrorsInFields: (fieldNames?: string[]) => boolean;
  t: (key: string) => string;
}

export type ReactLayoutAdapter = React.ComponentType<ReactLayoutAdapterProps>;

let _adapter: ReactLayoutAdapter | null = null;

export function registerLayoutAdapter(adapter: ReactLayoutAdapter): void {
  _adapter = adapter;
}

export function getLayoutAdapter(): ReactLayoutAdapter | null {
  return _adapter;
}

export function clearLayoutAdapter(): void {
  _adapter = null;
}
