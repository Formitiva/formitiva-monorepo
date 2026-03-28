import { ref, onUnmounted, type Ref } from "vue";
import { IS_TEST_ENV } from '@formitiva/core';

export type DebouncedCallback = {
  callback: (...args: unknown[]) => void;
  cancel: () => void;
  flush: () => void;
};

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

/**
 * createDebouncedCallback - non-hook variant that returns the same API but
 * doesn't use React hooks. Useful for creating many debounced callbacks
 * programmatically (e.g., driven from a static schema) while handling
 * lifecycle cleanup manually.
 */
export function createDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean; trailing?: boolean }
): DebouncedCallback {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: unknown[] | null = null;

  const leading = options?.leading === true;
  const trailing = options?.trailing !== false; // lodash default

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
