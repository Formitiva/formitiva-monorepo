// General runtime environment flags used across the core package
const _proc = (globalThis as Record<string, unknown>)['process'] as { env?: Record<string, string | undefined> } | undefined;
export const IS_TEST_ENV = _proc?.env?.['NODE_ENV'] === 'test';
