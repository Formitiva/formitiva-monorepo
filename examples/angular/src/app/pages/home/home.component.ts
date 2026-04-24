/**
 * home.component.ts — Basic / Quick Start Example
 *
 * Demonstrates the simplest way to use @formitiva/angular:
 * 1. Import FormitivaComponent into a standalone component
 * 2. Define a definition object inline
 * 3. Pass an onSubmit handler as an @Input binding
 */
import { Component, signal } from '@angular/core';
import { FormitivaComponent } from '@formitiva/angular';
import type { FormSubmissionHandler } from '@formitiva/angular';

const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  properties: [
    {
      name: 'fullName',
      displayName: 'Full Name',
      type: 'text',
      defaultValue: '',
      required: true,
    },
    {
      name: 'email',
      displayName: 'Email',
      type: 'email',
      defaultValue: '',
      tooltip: 'We will never share your email with anyone else.',
      required: false,
    },
    {
      name: 'subject',
      displayName: 'Subject',
      type: 'text',
      defaultValue: ''
    },
    {
      name: 'message',
      displayName: 'Message',
      type: 'multiline',
      defaultValue: '',
      required: false
    },
    {
      name: 'length',
      displayName: 'Message Length',
      type: 'unit',
      dimension: 'length',
      defaultValue: 6,
      defaultUnit: 'cm',
    },
    {
      "type": "slider",
      "name": "slider",
      "displayName": "Slider",
      "defaultValue": "",
      "min": 0,
      "max": 100
    },
    {
      "type": "color",
      "name": "color_1",
      "displayName": "Background Color",
      "defaultValue": ""
    }
  ],
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Basic / Quick Start</h2>
      <p class="desc">
        The simplest integration: import <code>FormitivaComponent</code>, supply a definition object,
        and pass an inline <code>[onSubmit]</code> handler. The submitted values are shown below.
      </p>

      <fv-formitiva
        [definitionData]="definition"
        [onSubmit]="handleSubmit"
        [displayInstanceName]="false"
      ></fv-formitiva>

      @if (lastSubmission()) {
        <div class="result-box success">{{ lastSubmission() }}</div>
      }
    </div>
  `,
})
export class HomeComponent {
  definition = definition;
  lastSubmission = signal('');

  handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    this.lastSubmission.set(JSON.stringify(values, null, 2));
    return undefined; // no errors → form submitted successfully
  };
}
