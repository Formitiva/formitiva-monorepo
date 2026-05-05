import { registerPlugin } from '@formitiva/angular';
import type { FormitivaPlugin, VisibilityHandler, FormValidationHandler } from '@formitiva/angular';
import { submissionBridge } from './bridge';

const isBusinessAccount: VisibilityHandler = (_field, values) =>
  values['accountType'] === 'business' ? 'visible' : 'invisible';

const customerOnboardingValidator: FormValidationHandler = (values, t) => {
  if (values['accountType'] === 'business' && !String(values['companyName'] ?? '').trim())
    return [t('Company Name is required for business accounts.')];
  return undefined;
};

const customerOnboardingPlugin: FormitivaPlugin = {
  name: 'customer-onboarding-plugin',
  version: '1.0.0',
  description: 'Visibility, validation, and submission for the Customer Registration form.',
  visibilityHandlers: { 'biz:isBusinessAccount': isBusinessAccount },
  formValidators: { 'biz:customerOnboardingValidator': customerOnboardingValidator },
  submissionHandlers: {
    'biz:customerOnboarding': (_def, _instance, values, _t) => {
      submissionBridge.onSubmit?.('Customer Registration', values);
      return undefined;
    },
  },
};

export function registerCustomerOnboardingPlugin(): void {
  registerPlugin(customerOnboardingPlugin, { conflictResolution: 'skip' });
}
