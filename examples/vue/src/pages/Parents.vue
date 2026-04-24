<script setup lang="ts">
/**
 * Parents.vue — Conditional Fields Example
 */
import { Formitiva } from '@formitiva/vue';

const definition = {
  name: 'parentsExample',
  displayName: 'Conditional Fields Example',
  version: '1.0.0',
  properties: [
    { type: 'checkbox', name: 'enableAdvanced',  displayName: 'Enable Advanced Options', defaultValue: false },
    { type: 'text',     name: 'advancedOption1', displayName: 'Advanced Option 1',        defaultValue: '', parents: { enableAdvanced: [true] } },
    { type: 'int',      name: 'advancedOption2', displayName: 'Advanced Option 2',        defaultValue: 0,  parents: { enableAdvanced: [true] } },
    { type: 'dropdown', name: 'category', displayName: 'Category', defaultValue: 'a',
      options: [{ label: 'Type A', value: 'a' }, { label: 'Type B', value: 'b' }, { label: 'Type C', value: 'c' }] },
    { type: 'text',        name: 'typeAField', displayName: 'Type A — Specific Field',          defaultValue: '', parents: { category: ['a'] } },
    { type: 'text',        name: 'typeBField', displayName: 'Type B — Specific Field',          defaultValue: '', parents: { category: ['b'] } },
    { type: 'description', name: 'typeCNote',  displayName: 'Type C has no additional fields.', displayText: 'Type C has no additional fields.', defaultValue: '', parents: { category: ['c'] } },
    { type: 'dropdown', name: 'country', displayName: 'Country', defaultValue: 'us',
      options: [{ label: 'United States', value: 'us' }, { label: 'Canada', value: 'ca' }, { label: 'Other', value: 'other' }] },
    { type: 'dropdown', name: 'usState',    displayName: 'US State',          defaultValue: 'CA', parents: { country: ['us'] },
      options: [{ label: 'California', value: 'CA' }, { label: 'New York', value: 'NY' }, { label: 'Texas', value: 'TX' }, { label: 'Florida', value: 'FL' }, { label: 'Other', value: 'other' }] },
    { type: 'dropdown', name: 'caProvince', displayName: 'Canadian Province', defaultValue: 'ON', parents: { country: ['ca'] },
      options: [{ label: 'Ontario', value: 'ON' }, { label: 'Quebec', value: 'QC' }, { label: 'British Columbia', value: 'BC' }, { label: 'Alberta', value: 'AB' }, { label: 'Other', value: 'other' }] },
    { type: 'text',     name: 'otherCountry', displayName: 'Specify Country', defaultValue: '', parents: { country: ['other'] } },
  ],
};
</script>

<template>
  <div class="page-content">
    <h2>Conditional Fields (Parents)</h2>
    <p class="desc">
      Add a <code>parents</code> map to a field to make it conditionally visible.
      The map keys are parent field names; values are arrays of the allowed parent values.
      The child field is shown only when the parent matches one of those values.
    </p>

    <Formitiva
      :definition-data="definition"
      :display-instance-name="false"
    />
  </div>
</template>
