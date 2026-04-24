/**
 * themes.component.ts — Theme Demo Example
 */
import { Component } from '@angular/core';
import { FormitivaComponent } from '@formitiva/angular';
import type { FormSubmissionHandler } from '@formitiva/angular';

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

@Component({
  selector: 'app-themes',
  standalone: true,
  imports: [FormitivaComponent],
  template: `
    <div class="page-content">
      <h2>Theme Demo</h2>
      <p class="desc">Select a theme to preview how Formitiva renders with different themes.</p>

      <div class="lang-selector">
        <label for="theme">Theme:</label>
        <select id="theme" [value]="theme" (change)="theme = ($any($event.target)).value">
          <option value="light">Light (default)</option>
          <option value="material">Material</option>
          <option value="material-dark">Material Dark</option>
        </select>
      </div>

      <fv-formitiva
        [definitionData]="definition"
        [onSubmit]="handleSubmit"
        [displayInstanceName]="false"
        [theme]="theme"
      ></fv-formitiva>

      @if (lastSubmission) {
        <div class="result-box success">{{ lastSubmission }}</div>
      }
    </div>
  `,
})
export class ThemesComponent {
  definition = definition;
  theme = 'light';
  lastSubmission = '';

  handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    this.lastSubmission = JSON.stringify(values, null, 2);
    return undefined;
  };
}
