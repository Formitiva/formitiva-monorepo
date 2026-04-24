/**
 * Translation.tsx — Translation / i18n Example
 *
 * Demonstrates runtime language switching via the `language` prop.
 * The definition sets `localization: 'personal_information'`.
 * Formitiva fetches `/locales/{lang}/personal_information.json`.
 */
import { useState } from 'react';
import { Formitiva } from '@formitiva/react';
import type { FormitivaInstance } from '@formitiva/react';

const definition = {
  name: 'personalInformation',
  displayName: 'Personal Information',
  version: '1.0.0',
  localization: 'personal_information',
  properties: [
    { type: 'text',      name: 'name',         displayName: 'Name',         defaultValue: '', required: true },
    { type: 'date',      name: 'birthday',     displayName: 'Birth Day',    defaultValue: '', required: true },
    { type: 'int',       name: 'age',          displayName: 'Age',          defaultValue: 0,  min: 0, minInclusive: true },
    { type: 'dropdown',  name: 'gender',       displayName: 'Gender',       defaultValue: 'male',
      options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
    { type: 'email',     name: 'email',        displayName: 'Email',        defaultValue: '' },
    { type: 'multiline', name: 'introduction', displayName: 'Introduction', defaultValue: '',
      tooltip: 'Summarize your educational background and professional experience',
      labelLayout: 'column-left' },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'translationDemo',
  version: '1.0.0',
  definition: 'personalInformation',
  values: { name: 'Alice', birthday: '1990-05-15', age: 33, gender: 'female', email: 'alice@example.com', introduction: '' },
};

export default function Translation() {
  const [language, setLanguage] = useState('en');

  return (
    <div className="page-content">
      <h2>Translation / i18n</h2>
      <p className="desc">
        Set <code>localization</code> in the definition to a key (e.g. <code>'personal_information'</code>).
        Formitiva loads <code>/locales/&#123;lang&#125;/personal_information.json</code> and translates
        field labels and options. Switch the language below — the form relabels instantly.
      </p>

      <div className="lang-selector">
        <label htmlFor="lang">Language:</label>
        <select id="lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <Formitiva
        definitionData={definition}
        instance={preloadedInstance}
        language={language}
      />
    </div>
  );
}
