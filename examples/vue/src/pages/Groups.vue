<script setup lang="ts">
/**
 * Groups.vue — Field Groups Example
 */
import { Formitiva } from '@formitiva/vue';
import type { FormitivaInstance } from '@formitiva/vue';

const definition = {
  name: 'userProfile',
  displayName: 'User Profile',
  version: '1.0.0',
  properties: [
    { type: 'text',     name: 'firstName',     displayName: 'First Name',              defaultValue: '', required: true, group: 'Personal' },
    { type: 'text',     name: 'lastName',      displayName: 'Last Name',               defaultValue: '', required: true, group: 'Personal' },
    { type: 'date',     name: 'birthDate',     displayName: 'Date of Birth',           defaultValue: '',                group: 'Personal' },
    { type: 'dropdown', name: 'gender',        displayName: 'Gender',                  defaultValue: '',                group: 'Personal',
      options: [{ label: 'Prefer not to say', value: '' }, { label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Other', value: 'other' }] },
    { type: 'email',    name: 'email',         displayName: 'Email Address',           defaultValue: '', required: true, group: 'Contact' },
    { type: 'phone',    name: 'phone',         displayName: 'Phone Number',            defaultValue: '',                group: 'Contact' },
    { type: 'text',     name: 'address',       displayName: 'Address',                 defaultValue: '',                group: 'Contact' },
    { type: 'dropdown', name: 'theme',         displayName: 'Preferred Theme',         defaultValue: 'light',           group: 'Preferences',
      options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] },
    { type: 'switch',   name: 'newsletter',    displayName: 'Subscribe to newsletter', defaultValue: false,             group: 'Preferences' },
    { type: 'switch',   name: 'notifications', displayName: 'Enable notifications',    defaultValue: true,              group: 'Preferences' },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'groupExampleInstance',
  version: '1.0.0',
  definition: 'userProfile',
  values: {
    firstName: 'Alice', lastName: 'Chen', birthDate: '1995-08-20',
    gender: 'female', email: 'alice@example.com', phone: '+1-555-0100',
    address: '123 Main St, Springfield', theme: 'dark',
    newsletter: true, notifications: false,
  },
};
</script>

<template>
  <div class="page-content">
    <h2>Field Groups</h2>
    <p class="desc">
      Add a <code>group</code> string to each field to have Formitiva automatically
      render collapsible section headers. Fields without a group appear at the top level.
    </p>

    <Formitiva
      :definition-data="definition"
      :instance="preloadedInstance"
      theme="material"
    />
  </div>
</template>
