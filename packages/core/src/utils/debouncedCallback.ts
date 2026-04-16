/**
 * debouncedCallback.ts
 *
 * Framework-agnostic debounced callback factory.
 * Previously duplicated verbatim inside:
 *   - packages/react/src/hooks/useDebouncedCallback.ts  (as createDebouncedCallback)
 *   - packages/vue/src/hooks/useDebouncedCallback.ts    (as createDebouncedCallback)
 *   - packages/vanilla/src/hooks/useDebouncedCallback.ts (sole implementation)
 *
 * The React/Vue hooks re-export this and add framework lifecycle wrappers on top.
 */

import { IS_TEST_ENV } from '../core/env';

export type DebouncedCallback = {
  callback: (...args: unknown[]) => void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Creates a debounced wrapper for `callback`.
 *
 * @param callback - Function to debounce
 * @param wait     - Debounce delay in ms (default 300)
 * @param options.leading  - Fire on the leading edge (default false)
 * @param options.trailing - Fire on the trailing edge (default true)
 *
 * In test environments (`NODE_ENV=test`) the callback is invoked immediately
 * with no debouncing so tests remain synchronous.
 */
export function createDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean; trailing?: boolean },
): DebouncedCallback {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: unknown[] | null = null;

  const leading = options?.leading === true;
  const trailing = options?.trailing !== false;

  const invoke = (args: unknown[]) => {
    callback(...args);
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    lastArgs = null;
  };

  const flush = () => {
    if (timer && trailing && lastArgs) {
      clearTimeout(timer);
      timer = undefined;
      invoke(lastArgs);
      lastArgs = null;
    }
  };

  const debounced = (...args: unknown[]) => {
    if (IS_TEST_ENV) {
      invoke(args);
      return;
    }

    const isLeadingCall = leading && !timer;

    lastArgs = args;

    if (isLeadingCall) {
      invoke(args);
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      if (trailing && lastArgs) {
        invoke(lastArgs);
        lastArgs = null;
      }
    }, wait);
  };

  return { callback: debounced, cancel, flush };
}
