/**
 * schemas/index.ts
 *
 * Central map of schema key → JSON definition.
 * Each entry corresponds to a real business form JSON file.
 * The map key is used for navigation; FormitivaDefinition provides
 * the name, displayName, version, submitterRef, validatorRef, and properties.
 */
import type { FormitivaDefinition } from '@formitiva/react';

import customerOnboarding from './customer-onboarding.json';
import supportTicket       from './support-ticket.json';
import purchaseOrder       from './purchase-order.json';
import leaveRequest        from './leave-request.json';

/**
 * Ordered map of schema key → Formitiva definition.
 * Keys are stable identifiers used for routing/state; displayName
 * from each JSON is what appears in the navigation.
 */
export const schemaMap: Record<string, FormitivaDefinition> = {
  'customer-onboarding': customerOnboarding as unknown as FormitivaDefinition,
  'support-ticket':      supportTicket      as unknown as FormitivaDefinition,
  'purchase-order':      purchaseOrder      as unknown as FormitivaDefinition,
  'leave-request':       leaveRequest       as unknown as FormitivaDefinition,
};

export const schemaKeys = Object.keys(schemaMap) as Array<keyof typeof schemaMap>;
