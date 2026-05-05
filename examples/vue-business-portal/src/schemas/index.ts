import type { FormitivaDefinition } from '@formitiva/vue';

import customerOnboarding from './customer-onboarding.json';
import supportTicket       from './support-ticket.json';
import purchaseOrder       from './purchase-order.json';
import leaveRequest        from './leave-request.json';

export const schemaMap: Record<string, FormitivaDefinition> = {
  'customer-onboarding': customerOnboarding as unknown as FormitivaDefinition,
  'support-ticket':      supportTicket      as unknown as FormitivaDefinition,
  'purchase-order':      purchaseOrder      as unknown as FormitivaDefinition,
  'leave-request':       leaveRequest       as unknown as FormitivaDefinition,
};

export const schemaKeys = Object.keys(schemaMap) as Array<keyof typeof schemaMap>;
