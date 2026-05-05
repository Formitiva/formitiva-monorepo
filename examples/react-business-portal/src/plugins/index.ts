/**
 * plugins/index.ts
 *
 * Entry point for all business-form plugins.
 * Each form has its own plugin file with a dedicated `register*Plugin()` function.
 * Call `registerAllBusinessPlugins()` once at app startup to activate every form.
 *
 * File → Plugin mapping:
 *   customerOnboardingPlugin.ts  →  registerCustomerOnboardingPlugin()
 *   supportTicketPlugin.ts       →  registerSupportTicketPlugin()
 *   purchaseOrderPlugin.ts       →  registerPurchaseOrderPlugin()
 *   leaveRequestPlugin.ts        →  registerLeaveRequestPlugin()
 */

// ── Shared bridge (re-exported so App.tsx can wire the onSubmit callback) ──────
export { submissionBridge } from './bridge';

// ── Individual plugin registration functions ───────────────────────────────────
export { registerCustomerOnboardingPlugin } from './customerOnboardingPlugin';
export { registerSupportTicketPlugin }      from './supportTicketPlugin';
export { registerPurchaseOrderPlugin }      from './purchaseOrderPlugin';
export { registerLeaveRequestPlugin }       from './leaveRequestPlugin';

// ── Convenience: register all four plugins at once ─────────────────────────────
import { registerCustomerOnboardingPlugin } from './customerOnboardingPlugin';
import { registerSupportTicketPlugin }      from './supportTicketPlugin';
import { registerPurchaseOrderPlugin }      from './purchaseOrderPlugin';
import { registerLeaveRequestPlugin }       from './leaveRequestPlugin';

/**
 * Register every business-form plugin with Formitiva.
 * Call this once before rendering the app (e.g. in main.tsx or App.tsx).
 */
export function registerAllBusinessPlugins(): void {
  registerCustomerOnboardingPlugin();
  registerSupportTicketPlugin();
  registerPurchaseOrderPlugin();
  registerLeaveRequestPlugin();
}

// Auto-register when this module is first imported.
registerAllBusinessPlugins();
