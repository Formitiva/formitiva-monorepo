/**
 * dropdownPositionUtils.ts
 *
 * Pure DOM-geometry calculation for portal dropdown menus.
 * Previously duplicated in:
 *   - packages/react/src/hooks/useDropdownPosition.ts
 *   - packages/vue/src/hooks/useDropdownPosition.ts
 *   - packages/vanilla/src/hooks/useDropdownPosition.ts
 *
 * Framework hooks keep their own reactive/lifecycle wrappers and
 * call this function for the actual position math.
 */

export interface DropdownPosition {
  left: number;
  top: number;
  width: number;
}

/**
 * Computes the viewport-clamped position for a dropdown menu that should
 * appear below `el`, constrained so it fits within the viewport.
 *
 * @param el        - The trigger/control element whose bounding rect is used
 * @param maxHeight - The maximum height of the dropdown (used for bottom-edge clamping)
 */
export function computeDropdownPosition(el: HTMLElement, maxHeight = 200): DropdownPosition {
  const rect = el.getBoundingClientRect();
  const width = Math.max(80, Math.round(rect.width));
  const left = Math.min(rect.left, window.innerWidth - width);
  const top = Math.min(rect.bottom, window.innerHeight - maxHeight);
  return { left, top, width };
}
