import { registerPlugin } from '@formitiva/angular';
import type { FormitivaPlugin, VisibilityHandler, FormValidationHandler } from '@formitiva/angular';
import { submissionBridge } from './bridge';

const isBugCategory: VisibilityHandler = (_field, values) =>
  values['category'] === 'bug' ? 'visible' : 'invisible';

const isBugOrFeature: VisibilityHandler = (_field, values) =>
  (values['category'] === 'bug' || values['category'] === 'feature') ? 'visible' : 'invisible';

const supportTicketValidator: FormValidationHandler = (values, t) => {
  const desc = String(values['description'] ?? '').trim();
  if (desc.length < 20) return [t('Description must be at least 20 characters long.')];
  return undefined;
};

const supportTicketPlugin: FormitivaPlugin = {
  name: 'support-ticket-plugin',
  version: '1.0.0',
  description: 'Visibility, validation, and submission for the Support Ticket form.',
  visibilityHandlers: {
    'biz:isBugCategory': isBugCategory,
    'biz:isBugOrFeature': isBugOrFeature,
  },
  formValidators: { 'biz:supportTicketValidator': supportTicketValidator },
  submissionHandlers: {
    'biz:supportTicket': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Support Ticket', values);
      return undefined;
    },
  },
};

export function registerSupportTicketPlugin(): void {
  registerPlugin(supportTicketPlugin, { conflictResolution: 'skip' });
}
