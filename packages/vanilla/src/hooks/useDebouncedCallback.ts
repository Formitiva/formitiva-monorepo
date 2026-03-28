import { IS_TEST_ENV } from '@formitiva/core';

export type DebouncedCallback = {
  callback: (...args: unknown[]) => void;
  cancel: () => void;
  flush: () => void;
};

/**
 * createDebouncedCallback - non-hook utility that returns the same API.
 * Useful for creating many debounced callbacks programmatically.
 */
export function createDebouncedCallback(
  callback: (...args: unknown[]) => unknown,
  wait = 300,
  options?: { leading?: boolean; trailing?: boolean }
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

/** @deprecated Use createDebouncedCallback instead */
export const useDebouncedCallback = createDebouncedCallback;
