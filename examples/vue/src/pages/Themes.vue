<script setup lang="ts">
import { ref } from 'vue';
import { Formitiva } from '@formitiva/vue';
import type { FormSubmissionHandler } from '@formitiva/vue';
import '@formitiva/core/themes/material.css';
import '@formitiva/core/themes/material-dark.css';

const definition = {
  name: 'themeDemoForm',
  version: '1.0.0',
  displayName: 'Theme Demo',
  properties: [
    { name: 'fullName', displayName: 'Full Name', type: 'text', defaultValue: '', required: true },
    { name: 'email', displayName: 'Email', type: 'email', defaultValue: '' },
    { name: 'subject', displayName: 'Subject', type: 'text', defaultValue: '' },
    { name: 'message', displayName: 'Message', type: 'multiline', defaultValue: '' },
  ],
};

const theme = ref('light');
const lastSubmission = ref('');

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  lastSubmission.value = JSON.stringify(values, null, 2);
  return undefined;
};
</script>

<template>
  <div class="page-content">
    <h2>Theme Demo</h2>
    <p class="desc">Select a theme to preview how Formitiva renders with different themes.</p>

    <div class="lang-selector">
      <label for="theme">Theme:</label>
      <select id="theme" v-model="theme">
        <option value="light">Light (default)</option>
        <option value="material">Material</option>
        <option value="material-dark">Material Dark</option>
      </select>
    </div>

    <div :data-formitiva-theme="theme">
      <Formitiva :definition-data="definition" :on-submit="handleSubmit" :display-instance-name="false" />
    </div>

    <div v-if="lastSubmission" class="result-box success">{{ lastSubmission }}</div>
  </div>
</template>
