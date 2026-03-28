export const IS_TEST_ENV =
  typeof process !== 'undefined' &&
  (process as { env?: Record<string, string | undefined> })?.env?.['NODE_ENV'] === 'test';
