<script setup lang="ts">
/**
 * Home.vue — Basic / Quick Start Example
 */
import { ref } from 'vue';
import { Formitiva } from '@formitiva/vue';
import type { FormSubmissionHandler } from '@formitiva/vue';
import '@formitiva/core/themes/material-dark.css';

const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  properties: [
    { name: 'fullName',  displayName: 'Full Name',       type: 'text',      defaultValue: '', required: true },
    { name: 'email',     displayName: 'Email',            type: 'email',     defaultValue: '', tooltip: 'We will never share your email with anyone else.' },
    { name: 'subject',   displayName: 'Subject',          type: 'text',      defaultValue: '' },
    { name: 'message',   displayName: 'Message',          type: 'multiline', defaultValue: '' },
    { name: 'length',    displayName: 'Message Length',   type: 'unit',      dimension: 'length', defaultValue: 6, defaultUnit: 'cm' },
    { name: 'slider',    displayName: 'Slider',           type: 'slider',    defaultValue: '', min: 0, max: 100 },
    { name: 'color_1',   displayName: 'Background Color', type: 'color',     defaultValue: '' },
  ],
};

const lastSubmission = ref('');

const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
  lastSubmission.value = JSON.stringify(values, null, 2);
  return undefined;
};
</script>

<template>
  <div class="page-content">
    <h2>Basic / Quick Start</h2>
    <p class="desc">
      The simplest integration: import <code>Formitiva</code>, supply a definition object,
      and pass an inline <code>:onSubmit</code> handler. The submitted values are shown below.
    </p>

    <Formitiva
      :definition-data="definition"
      :on-submit="handleSubmit"
      theme="material-dark"
      :display-instance-name="false"
    />

    <div v-if="lastSubmission" class="result-box success">{{ lastSubmission }}</div>
  </div>
</template>
