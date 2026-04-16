import { ref, onUnmounted, type Ref } from "vue";
import { IS_TEST_ENV } from '@formitiva/core';
import type { DebouncedCallback } from '@formitiva/core';
export { createDebouncedCallback } from '@formitiva/core';
export type { DebouncedCallback } from '@formitiva/core';

/**
 * useDebouncedCallback
 * - callback: function to call
 * - wait: debounce delay in ms
 * - options.leading: if true, call on leading edge (optional)
 *
 * Returns { callback, cancel, flush } where callback is debounced.
 */

export function useDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean; trailing?: boolean }
): DebouncedCallback {
  const timer: Ref<ReturnType<typeof setTimeout> | undefined> = ref();
  const lastArgs: Ref<unknown[] | null> = ref(null);

  const leading = options?.leading === true;
  const trailing = options?.trailing !== false; // lodash default

  // Cleanup on unmount
  onUnmounted(() => {
    if (timer.value) {
      clearTimeout(timer.value);
    }
  });

  const invoke = (args: unknown[]) => {
    callback(...args);
  };

  const cancel = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = undefined;
    }
    lastArgs.value = null;
  };

  const flush = () => {
    if (timer.value) {
      clearTimeout(timer.value);
      timer.value = undefined;
    }
    if (trailing && lastArgs.value) {
      invoke(lastArgs.value);
      lastArgs.value = null;
    }
  };

  const debounced = (...args: unknown[]) => {
    if (IS_TEST_ENV) {
      // No debounce in test environment
      invoke(args);
      return;
    }

    const isLeadingCall = leading && !timer.value;

    lastArgs.value = args;

    if (isLeadingCall) {
      invoke(args);
    }

    if (timer.value) {
      clearTimeout(timer.value);
    }

    timer.value = setTimeout(() => {
      timer.value = undefined;

      if (trailing && lastArgs.value) {
        invoke(lastArgs.value);
        lastArgs.value = null;
      }
    }, wait);
  };

  return { callback: debounced, cancel, flush };
}
