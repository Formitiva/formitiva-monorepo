/**
 * translation.ts — Translation / i18n Example
 */
import { Formitiva } from '@formitiva/vanilla';
import type { FormitivaInstance } from '@formitiva/vanilla';

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
      tooltip: 'Summarize your educational background and professional experience', labelLayout: 'column-left' },
  ],
};

const preloadedInstance: FormitivaInstance = {
  name: 'translationDemo', version: '1.0.0', definition: 'personalInformation',
  values: { name: 'Alice', birthday: '1990-05-15', age: 33, gender: 'female', email: 'alice@example.com', introduction: '' },
};

export default async function render(container: HTMLElement) {
  let currentForm: Formitiva | null = null;
  let formContainer: HTMLElement;

  container.innerHTML = `
    <div class="page-content">
      <h2>Translation / i18n</h2>
      <p class="desc">
        Set <code>localization</code> in the definition to a key (e.g. <code>'personal_information'</code>).
        Formitiva loads <code>/locales/{lang}/personal_information.json</code> and translates
        field labels and options. Switch the language below — the form relabels instantly.
      </p>
      <div class="lang-selector">
        <label for="lang">Language:</label>
        <select id="lang">
          <option value="en">English</option>
          <option value="de">Deutsch</option>
          <option value="fr">Français</option>
        </select>
      </div>
      <div id="form-container"></div>
    </div>
  `;

  formContainer = container.querySelector('#form-container') as HTMLElement;
  const select = container.querySelector('#lang') as HTMLSelectElement;

  async function mountForm(language: string) {
    currentForm?.unmount();
    formContainer.innerHTML = '';
    currentForm = new Formitiva({
      definitionData: definition,
      instance: preloadedInstance,
      language,
      theme: 'material',
    });
    await currentForm.mount(formContainer);
  }

  select.addEventListener('change', () => mountForm(select.value));
  await mountForm('en');
}
