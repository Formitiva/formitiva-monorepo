/**
 * plugins/supportTicketPlugin.ts
 *
 * Handles the "Support Ticket" form (support-ticket.json).
 *
 * JSON schema references:
 *   submitterRef  → "biz:supportTicket"
 *   validatorRef  → "biz:supportTicketValidator"
 *   visibilityRef → "biz:isBugCategory"   (on stepsToReproduce)
 *   visibilityRef → "biz:isBugOrFeature"  (on expectedBehavior)
 *
 * Business rules:
 *   • "Steps to Reproduce" is shown only for bug reports.
 *   • "Expected Behavior" is shown for bug reports and feature requests.
 *   • Description must be at least 20 characters before the ticket can be submitted.
 *   • On submit, the form values are forwarded to the submission bridge
 *     (in production this would create a ticket in your helpdesk system).
 */
import { registerPlugin } from '@formitiva/react';
import type {
  FormitivaPlugin,
  VisibilityHandler,
  FormValidationHandler,
} from '@formitiva/react';
import { submissionBridge } from './bridge';

// ── Visibility ─────────────────────────────────────────────────────────────────

/** Show "Steps to Reproduce" only when the category is a bug report. */
const isBugCategory: VisibilityHandler = (_field, values) =>
  values['category'] === 'bug' ? 'visible' : 'invisible';

/** Show "Expected Behavior" for both bug reports and feature requests. */
const isBugOrFeature: VisibilityHandler = (_field, values) =>
  (values['category'] === 'bug' || values['category'] === 'feature') ? 'visible' : 'invisible';

// ── Validation ─────────────────────────────────────────────────────────────────

/** Ticket description must be at least 20 characters to be meaningful. */
const supportTicketValidator: FormValidationHandler = (values, t) => {
  const desc = String(values['description'] ?? '').trim();
  if (desc.length < 20) {
    return [t('Description must be at least 20 characters long.')];
  }
  return undefined;
};

// ── Plugin ─────────────────────────────────────────────────────────────────────

const supportTicketPlugin: FormitivaPlugin = {
  name: 'support-ticket-plugin',
  version: '1.0.0',
  description: 'Handles visibility, validation, and submission for the Support Ticket form.',

  visibilityHandlers: {
    'biz:isBugCategory':  isBugCategory,
    'biz:isBugOrFeature': isBugOrFeature,
  },

  formValidators: {
    'biz:supportTicketValidator': supportTicketValidator,
  },

  submissionHandlers: {
    'biz:supportTicket': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Support Ticket', values);
      return undefined;
    },
  },
};

/** Register the Support Ticket plugin with Formitiva. */
export function registerSupportTicketPlugin(): void {
  registerPlugin(supportTicketPlugin, { conflictResolution: 'skip' });
}
