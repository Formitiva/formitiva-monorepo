/**
 * themes.ts — Theme Demo Example (Vanilla)
 */
import { Formitiva } from '@formitiva/vanilla';
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

export default async function render(container: HTMLElement) {
  const resultBox = document.createElement('div');

  container.innerHTML = `
    <div class="page-content">
      <h2>Theme Demo</h2>
      <p class="desc">Select a theme to preview how Formitiva renders with different themes.</p>
      <div class="lang-selector">
        <label for="theme-select">Theme:</label>
        <select id="theme-select">
          <option value="light">Light (default)</option>
          <option value="material">Material</option>
          <option value="material-dark">Material Dark</option>
        </select>
      </div>
    </div>
  `;

  const pageContent = container.querySelector('.page-content')!;
  const select = pageContent.querySelector('#theme-select') as HTMLSelectElement;

  const formHolder = document.createElement('div');
  pageContent.appendChild(formHolder);

  let currentForm: Formitiva | null = null;

  async function mountTheme(theme: string) {
    if (currentForm) {
      try { currentForm.unmount(); } catch { /* ignore */ }
      currentForm = null;
      formHolder.innerHTML = '';
    }

    const form = new Formitiva({
      definitionData: definition,
      displayInstanceName: false,
      theme,
      onSubmit: (_def, _instanceName, values, _t) => {
        resultBox.className = 'result-box success';
        resultBox.textContent = JSON.stringify(values, null, 2);
        return undefined;
      },
    });

    await form.mount(formHolder);
    currentForm = form;
  }

  select.addEventListener('change', () => {
    mountTheme(select.value || 'light');
  });

  await mountTheme(select.value || 'light');
  pageContent.appendChild(resultBox);
}
