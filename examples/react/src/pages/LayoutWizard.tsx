/**
 * LayoutWizard.tsx -Wizard Layout Example
 *
 * Demonstrates the pro wizard layout: multi-step form with
 * Previous / Next navigation and a progress indicator.
 */
import { Formitiva } from '@formitiva/react';
import type { FormitivaInstance } from '@formitiva/react';

const definition = {
  name: 'onboardingWizard',
  displayName: 'Account Setup',
  version: '1.0.0',
  properties: [
    // Step 1 -Personal Info
    { type: 'text',     name: 'firstName',  displayName: 'First Name',      defaultValue: '', required: true },
    { type: 'text',     name: 'lastName',   displayName: 'Last Name',       defaultValue: '', required: true },
    { type: 'date',     name: 'birthDate',  displayName: 'Date of Birth',   defaultValue: '' },
    // Step 2 -Contact
    { type: 'email',    name: 'email',      displayName: 'Email Address',   defaultValue: '', required: true },
    { type: 'phone',    name: 'phone',      displayName: 'Phone Number',    defaultValue: '' },
    { type: 'text',     name: 'address',    displayName: 'Street Address',  defaultValue: '' },
    // Step 3 -Account
    { type: 'text',     name: 'username',   displayName: 'Username',        defaultValue: '', required: true },
    { type: 'password', name: 'password',   displayName: 'Password',        defaultValue: '', required: true },
    { type: 'password', name: 'confirmPwd', displayName: 'Confirm Password',defaultValue: '', required: true },
    // Step 4 -Preferences
    { type: 'dropdown', name: 'theme',      displayName: 'Theme',           defaultValue: 'light',
      options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] },
    { type: 'switch',   name: 'newsletter', displayName: 'Newsletter',      defaultValue: true },
    { type: 'switch',   name: 'terms',      displayName: 'I accept the Terms of Service', defaultValue: false, required: true },
  ],
};

const wizardLayout = {
  name: 'onboardingWizard',
  type: 'wizard' as const,
  displayName: 'Setup Wizard',
  sections: [
    { label: 'Personal',    name: 'personal',    props: ['firstName', 'lastName', 'birthDate'] },
    { label: 'Contact',     name: 'contact',     props: ['email', 'phone', 'address'] },
    { label: 'Account',     name: 'account',     props: ['username', 'password', 'confirmPwd'] },
    { label: 'Preferences', name: 'preferences', props: ['theme', 'newsletter', 'terms'] },
  ],
  defaultValue: 'personal',
};

const instance: FormitivaInstance = {
  name: 'wizardExample',
  version: '1.0.0',
  definition: 'onboardingWizard',
  values: {
    firstName: '', lastName: '', birthDate: '',
    email: '', phone: '', address: '',
    username: '', password: '', confirmPwd: '',
    theme: 'light', newsletter: true, terms: false,
  },
};

export default function LayoutWizard() {
  return (
    <div className="page-content">
      <h2>Wizard Layout</h2>
      <p className="desc">
        Pass a <code>type: "wizard"</code> layout to break a long form into sequential steps. The schema still only describes the fields; the app decides how those fields are grouped and navigated.
      </p>
      <Formitiva
        definitionData={definition}
        layout={wizardLayout}
        instance={instance}
        theme="material"
      />
    </div>
  );
}
