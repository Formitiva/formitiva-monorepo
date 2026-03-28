/**
 * Vanilla JS utility for calculating dropdown menu position.
 * Replaces the React useDropdownPosition hook.
 */

export interface DropdownPosition {
  left: number;
  top: number;
  width: number;
}

export interface DropdownPositionController {
  /** Re-calculate and return current position from the control element */
  getPosition(maxHeight?: number): DropdownPosition | null;
  /** Attach scroll/resize listeners that call the callback with updated position */
  startTracking(callback: (pos: DropdownPosition | null) => void, maxHeight?: number): () => void;
}

export function createDropdownPositionController(
  controlEl: HTMLElement | null
): DropdownPositionController {
  const getPosition = (maxHeight = 200): DropdownPosition | null => {
    if (!controlEl) return null;
    const rect = controlEl.getBoundingClientRect();
    let left = rect.left;
    let top = rect.bottom;
    const width = Math.max(80, Math.round(rect.width));
    left = Math.min(left, window.innerWidth - width);
    top = Math.min(top, window.innerHeight - maxHeight);
    return { left, top, width };
  };

  const startTracking = (
    callback: (pos: DropdownPosition | null) => void,
    maxHeight = 200
  ): (() => void) => {
    const update = () => callback(getPosition(maxHeight));
    update();

    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);

    let ro: ResizeObserver | null = null;
    if (controlEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(update);
      ro.observe(controlEl);
    }

    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  };

  return { getPosition, startTracking };
}

