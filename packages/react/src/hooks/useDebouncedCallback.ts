import { useCallback, useEffect, useRef } from "react";
import { createDebouncedCallback, IS_TEST_ENV } from '@formitiva/core';
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
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const latestCb = useRef(callback);
  const lastArgs = useRef<unknown[] | null>(null);

  const leading = options?.leading === true;
  const trailing = options?.trailing !== false; // lodash default

  // Keep latest callback
  useEffect(() => {
    latestCb.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const invoke = (args: unknown[]) => {
    latestCb.current(...args);
  };

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    lastArgs.current = null;
  }, []);

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    if (trailing && lastArgs.current) {
      invoke(lastArgs.current);
      lastArgs.current = null;
    }
  }, [trailing]);

  const debounced = useCallback(
    (...args: unknown[]) => {
      if (IS_TEST_ENV) {
        // No debounce in test environment
        invoke(args);
        return;
      }

      const isLeadingCall = leading && !timer.current;

      lastArgs.current = args;

      if (isLeadingCall) {
        invoke(args);
      }

      if (timer.current) {
        clearTimeout(timer.current);
      }

      timer.current = setTimeout(() => {
        timer.current = undefined;

        if (trailing && lastArgs.current) {
          invoke(lastArgs.current);
          lastArgs.current = null;
        }
      }, wait);
    },
    [leading, trailing, wait]
  );

  return { callback: debounced, cancel, flush };
}
