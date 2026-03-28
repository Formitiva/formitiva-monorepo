/**
 * parents.component.ts — Conditional Fields (Parents / Children) Example
 *
 * Demonstrates the `parents` map on a field definition.
 * A child field is only rendered when the specified parent field
 * has one of the listed values.
 *
 * Example flow:
 *  - "Enable Advanced Options" checkbox controls two advanced fields.
 *  - A "Category" dropdown determines which category-specific field appears.
 */
import { Component } from '@angular/core';
import { FormitivaComponent } from '@formitiva/angular';

const definition = {
  name: 'parentsExample',
  displayName: 'Conditional Fields Example',
  version: '1.0.0',
  properties: [
    // ── Toggle ────────────────────────────────────────────────
    {
      type: 'checkbox',
      name: 'enableAdvanced',
      displayName: 'Enable Advanced Options',
      defaultValue: false,
    },
    {
      type: 'text',
      name: 'advancedOption1',
      displayName: 'Advanced Option 1',
      defaultValue: '',
      // Only visible when enableAdvanced is true
      parents: { enableAdvanced: [true] },
    },
    {
      type: 'int',
      name: 'advancedOption2',
      displayName: 'Advanced Option 2',
      defaultValue: 0,
      parents: { enableAdvanced: [true] },
    },
    // ── Category-specific fields ──────────────────────────────
    {
      type: 'dropdown',
      name: 'category',
      displayName: 'Category',
      defaultValue: 'a',
      options: [
        { label: 'Type A', value: 'a' },
        { label: 'Type B', value: 'b' },
        { label: 'Type C', value: 'c' },
      ],
    },
    {
      type: 'text',
      name: 'typeAField',
      displayName: 'Type A — Specific Field',
      defaultValue: '',
      // Only visible when category === 'a'
      parents: { category: ['a'] },
    },
    {
      type: 'text',
      name: 'typeBField',
      displayName: 'Type B — Specific Field',
      defaultValue: '',
      parents: { category: ['b'] },
    },
    {
      name: 'typeCNote',
      displayName: 'Type C has no additional fields.',
      displayText: 'Type C has no additional fields.',
      type: 'description',
      defaultValue: '',
      parents: { category: ['c'] },
    },
    // ── Country/Region example ─────────────────────────────────
    {
      type: 'dropdown',
      name: 'country',
      displayName: 'Country',
      defaultValue: 'us',
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'dropdown',
      name: 'usState',
      displayName: 'US State',
      defaultValue: 'CA',
      parents: { country: ['us'] },
      options: [
        { label: 'California', value: 'CA' },
        { label: 'New York', value: 'NY' },
        { label: 'Texas', value: 'TX' },
        { label: 'Florida', value: 'FL' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'dropdown',
      name: 'caProvince',
      displayName: 'Canadian Province',
      defaultValue: 'ON',
      parents: { country: ['ca'] },
      options: [
        { label: 'Ontario', value: 'ON' },
        { label: 'Quebec', value: 'QC' },
        { label: 'British Columbia', value: 'BC' },
        { label: 'Alberta', value: 'AB' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      type: 'text',
      name: 'otherCountry',
      displayName: 'Specify Country',
      defaultValue: '',
      parents: { country: ['other'] },
    },
  ],
};

@Component({
  selector: 'app-parents',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Conditional Fields (Parents)</h2>
      <p class="desc">
        Add a <code>parents</code> map to a field to make it conditionally visible.
        The map keys are parent field names; values are arrays of the allowed parent values.
        The child field is shown only when the parent matches one of those values.
      </p>

      <fv-formitiva
        [definitionData]="definition"
        theme="material"
        [displayInstanceName]="false"
      ></fv-formitiva>
    </div>
  `,
})
export class ParentsComponent {
  definition = definition;
}
