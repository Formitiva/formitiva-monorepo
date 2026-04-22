/**
 * Vanilla JS utility for calculating dropdown menu position.
 * Replaces the React useDropdownPosition hook.
 */
import { computeDropdownPosition } from '@formitiva/core';
export { computeDropdownPosition } from '@formitiva/core';
export type { DropdownPosition } from '@formitiva/core';

export interface DropdownPositionController {
  /** Re-calculate and return current position from the control element */
  getPosition(maxHeight?: number): import('@formitiva/core').DropdownPosition | null;
  /** Attach scroll/resize listeners that call the callback with updated position */
  startTracking(callback: (pos: import('@formitiva/core').DropdownPosition | null) => void, maxHeight?: number): () => void;
}

export function createDropdownPositionController(
  controlEl: HTMLElement | null
): DropdownPositionController {
  const getPosition = (maxHeight = 200) => {
    if (!controlEl) return null;
    return computeDropdownPosition(controlEl, maxHeight);
  };

  const startTracking = (
    callback: (pos: import('@formitiva/core').DropdownPosition | null) => void,
    maxHeight = 200
  ): (() => void) => {
    const update = () => callback(getPosition(maxHeight));
    update();

    const controller = new AbortController();
    const { signal } = controller;

    window.addEventListener('scroll', update, { capture: true, passive: true, signal });
    window.addEventListener('resize', update, { signal });

    let ro: ResizeObserver | null = null;
    if (controlEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(controlEl);
    }

    return () => {
      controller.abort();
      ro?.disconnect();
    };
  };

  return { getPosition, startTracking };
}

