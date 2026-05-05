/**
 * plugins/bridge.ts
 *
 * Shared submission bridge — a mutable singleton that lets registered
 * submission handlers notify the React UI without prop-drilling.
 *
 * Usage:
 *   - Plugin handler calls  submissionBridge.onSubmit?.(label, values)
 *   - React component sets  submissionBridge.onSubmit = (label, values) => { … }
 */
export const submissionBridge: {
  onSubmit: ((formLabel: string, values: unknown) => void) | null;
} = { onSubmit: null };
