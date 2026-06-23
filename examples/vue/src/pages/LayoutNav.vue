<script lang="ts">
import { defineComponent } from 'vue';
import { Formitiva } from '@formitiva/vue';
import type { FormitivaInstance } from '@formitiva/vue';

/**
 * Nav layout definition and example instance
 */
const definition = {
  name: 'settingsNav',
  displayName: 'Settings',
  version: '1.0.0',
  properties: [
    { type: 'text',     name: 'displayName',  displayName: 'Display Name',   defaultValue: '', required: true },
    { type: 'email',    name: 'email',         displayName: 'Email Address',  defaultValue: '', required: true },
    { type: 'text',     name: 'bio',           displayName: 'Bio',            defaultValue: '' },
    { type: 'dropdown', name: 'theme',         displayName: 'Theme',          defaultValue: 'light',
      options: [{ label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }, { label: 'System', value: 'system' }] },
    { type: 'dropdown', name: 'language',      displayName: 'Language',       defaultValue: 'en',
      options: [{ label: 'English', value: 'en' }, { label: 'German', value: 'de' }, { label: 'French', value: 'fr' }] },
    { type: 'switch',   name: 'emailAlerts',   displayName: 'Email Alerts',   defaultValue: true },
    { type: 'switch',   name: 'pushAlerts',    displayName: 'Push Alerts',    defaultValue: false },
    { type: 'switch',   name: 'newsletter',    displayName: 'Newsletter',     defaultValue: true },
    { type: 'password', name: 'currentPass',   displayName: 'Current Password',  defaultValue: '' },
    { type: 'password', name: 'newPass',        displayName: 'New Password',      defaultValue: '' },
    { type: 'password', name: 'confirmPass',    displayName: 'Confirm Password',  defaultValue: '' },
  ],
};

const navLayout = {
  name: 'settingsNav',
  type: 'nav' as const,
  displayName: 'Settings Navigation',
  sections: [
    { label: 'General',       name: 'general',       props: ['displayName', 'email', 'bio'] },
    { label: 'Appearance',    name: 'appearance',    props: ['theme', 'language'] },
    { label: 'Notifications', name: 'notifications', props: ['emailAlerts', 'pushAlerts', 'newsletter'] },
    { label: 'Security',      name: 'security',      props: ['currentPass', 'newPass', 'confirmPass'] },
  ],
  defaultValue: 'general',
};

const instance: FormitivaInstance = {
  name: 'navExample',
  version: '1.0.0',
  definition: 'settingsNav',
  values: {
    displayName: 'Alice Chen', email: 'alice@example.com', bio: 'Software engineer.',
    theme: 'dark', language: 'en',
    emailAlerts: true, pushAlerts: false, newsletter: true,
    currentPass: '', newPass: '', confirmPass: '',
  },
};

export default defineComponent({
  name: 'LayoutNav',
  components: { Formitiva },
  setup() {
    return { definition, navLayout, instance };
  },
});

</script>

<template>
  <div class="page-content">
    <h2>Nav Layout</h2>
    <p class="desc">
      Pass a <code>type: "nav"</code> layout to add a left-side navigation panel. Each nav item declares which field <code>props</code> it owns, while the schema remains focused on field data.
    </p>
    <Formitiva
      :definition-data="definition"
      :layout="navLayout"
      :instance="instance"
      theme="material"
    />
  </div>
</template>
