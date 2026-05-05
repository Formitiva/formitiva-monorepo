/**
 * plugins/bridge.ts — Shared submission bridge
 * Lets plugin submission handlers notify the UI without prop-drilling.
 */
export const submissionBridge: {
  onSubmit: ((formLabel: string, values: unknown) => void) | null;
} = { onSubmit: null };
