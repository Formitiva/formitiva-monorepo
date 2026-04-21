import { BaseRegistry } from '../..';
import type { LayoutConfig } from '../formitivaTypes';

/**
 * Layout registry — holds layouts.
 */

const registry = new BaseRegistry<LayoutConfig>();

/**
 * Register a layout. The newly registered layout overwrites any previously
 * registered layout (only one layout is active at a time).
 */
export function registerLayout(name: string, config: LayoutConfig): void {
  if (!config || !config.type) {
    throw new Error('registerLayout: config must have a valid type');
  }
  registry.register(name, config);
}

/** Returns the currently active layout, or null if none is registered. */
export function getLayout(name: string): LayoutConfig | null {
  return registry.get(name) || null;
}
