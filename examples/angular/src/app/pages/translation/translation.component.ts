/**
 * translation.component.ts — Translation / i18n Example
 *
 * Demonstrates runtime language switching via the `[language]` @Input.
 *
 * The definition sets `localization: 'personal_information'`.
 * Formitiva will fetch `/locales/{lang}/personal_information.json` for
 * translated labels. Locale files for German (de) and French (fr) are
 * placed in the `public/locales/` folder and served as static assets.
 *
 * English is the default — no locale file is needed for 'en'.
 */
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormitivaComponent } from '@formitiva/angular';
import type { FormitivaInstance } from '@formitiva/angular';

const definition = {
  name: 'personalInformation',
  displayName: 'Personal Information',
  version: '1.0.0',
  // Locale files are at: public/locales/{lang}/personal_information.json
  localization: 'personal_information',
  properties: [
    {
      type: 'text',
      name: 'name',
      displayName: 'Name',
      defaultValue: '',
      required: true,
    },
    {
      type: 'date',
      name: 'birthday',
      displayName: 'Birth Day',
      defaultValue: '',
      required: true,
    },
    {
      type: 'int',
      name: 'age',
      displayName: 'Age',
      defaultValue: 0,
      min: 0,
      minInclusive: true,
    },
    {
      type: 'dropdown',
      name: 'gender',
      displayName: 'Gender',
      defaultValue: 'male',
      options: [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
    },
    {
      type: 'email',
      name: 'email',
      displayName: 'Email',
      defaultValue: '',
    },
    {
      type: 'multiline',
      name: 'introduction',
      displayName: 'Introduction',
      defaultValue: '',
      tooltip:
        'Summarize your educational background and professional experience',
      labelLayout: 'column-left',
    },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'translationDemo',
  version: '1.0.0',
  definition: 'personalInformation',
  values: {
    name: 'Alice',
    birthday: '1990-05-15',
    age: 33,
    gender: 'female',
    email: 'alice@example.com',
    introduction: '',
  },
};

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [FormitivaComponent, FormsModule],
  template: `
    <div class="page-content">
      <h2>Translation / i18n</h2>
      <p class="desc">
        Set <code>localization</code> in the definition to a key (e.g. <code>'personal_information'</code>).
        Formitiva loads <code>/locales/&#123;lang&#125;/personal_information.json</code> and translates
        field labels and options. Switch the language below — the form relabels instantly.
      </p>

      <div class="lang-selector">
        <label for="lang">Language:</label>
        <select id="lang" [(ngModel)]="language">
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <fv-formitiva
        [definitionData]="definition"
        [instance]="instance"
        [language]="language"
        theme="material"
      ></fv-formitiva>
    </div>
  `,
})
export class TranslationComponent {
  definition = definition;
  instance = preloadedInstance;
  language = 'en';
}
