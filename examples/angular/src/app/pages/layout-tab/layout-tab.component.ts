/**
 * layout-tab.component.ts -Tab Layout Example
 *
 * Demonstrates the pro tab layout: tab buttons above the form split
 * fields into sections passed through the layout API.
 */
import { Component } from '@angular/core';
import { FormitivaComponent } from '@formitiva/angular';
import type { FormitivaInstance } from '@formitiva/angular';

const definition = {
  name: 'profileTab',
  displayName: 'User Profile',
  version: '1.0.0',
  properties: [
    { type: 'text',     name: 'firstName',    displayName: 'First Name',      defaultValue: '', required: true },
    { type: 'text',     name: 'lastName',     displayName: 'Last Name',       defaultValue: '', required: true },
    { type: 'date',     name: 'birthDate',    displayName: 'Date of Birth',   defaultValue: '' },
    { type: 'dropdown', name: 'gender',       displayName: 'Gender',          defaultValue: '',
      options: [{ label: 'Prefer not to say', value: '' }, { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }] },
    { type: 'email',    name: 'email',        displayName: 'Email',           defaultValue: '', required: true },
    { type: 'phone',    name: 'phone',        displayName: 'Phone',           defaultValue: '' },
    { type: 'url',      name: 'website',      displayName: 'Website',         defaultValue: '' },
    { type: 'dropdown', name: 'theme',        displayName: 'Theme',           defaultValue: 'light',
      options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] },
    { type: 'switch',   name: 'newsletter',   displayName: 'Newsletter',      defaultValue: false },
    { type: 'switch',   name: 'betaFeatures', displayName: 'Beta Features',   defaultValue: false },
  ],
};

export const tabLayout = {
  name: 'profileTab',
  type: 'tab' as const,
  displayName: 'Profile Tabs',
  sections: [
    { label: 'Personal',    name: 'personal',    props: ['firstName', 'lastName', 'birthDate', 'gender'] },
    { label: 'Contact',     name: 'contact',     props: ['email', 'phone', 'website'] },
    { label: 'Preferences', name: 'preferences', props: ['theme', 'newsletter', 'betaFeatures'] },
  ],
  defaultValue: 'personal',
};

const instance: FormitivaInstance = {
  name: 'tabExample',
  version: '1.0.0',
  definition: 'profileTab',
  values: {
    firstName: 'Bob', lastName: 'Smith', birthDate: '1990-03-15', gender: 'male',
    email: 'bob@example.com', phone: '+1-555-0200', website: 'https://bob.dev',
    theme: 'light', newsletter: true, betaFeatures: false,
  },
};

@Component({
  selector: 'app-layout-tab',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Tab Layout</h2>
      <p class="desc">
        Pass a <code>type: "tab"</code> layout to render tab buttons above the form. Each tab owns a list of field <code>props</code>. Switching tabs shows only those fields, while the schema remains focused on field data.
      </p>
      <fv-formitiva
        [definitionData]="definition"
        [layout]="tabLayout"
        [instance]="instance"
        theme="material"
      ></fv-formitiva>
    </div>
  `,
})
export class LayoutTabComponent {
  definition = definition;
  tabLayout = tabLayout;
  instance = instance;
}
