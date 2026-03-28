/**
 * home.ts — Basic / Quick Start Example
 */
import { Formitiva } from '@formitiva/vanilla';
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

export default async function render(container: HTMLElement) {
  const resultBox = document.createElement('div');

  const form = new Formitiva({
    definitionData: definition,
    theme: 'material-dark',
    displayInstanceName: false,
    onSubmit: (_def, _instanceName, values, _t) => {
      resultBox.className = 'result-box success';
      resultBox.textContent = JSON.stringify(values, null, 2);
      return undefined;
    },
  });

  container.innerHTML = `
    <div class="page-content">
      <h2>Basic / Quick Start</h2>
      <p class="desc">
        The simplest integration: create a <code>new Formitiva({...})</code> instance,
        supply a definition object, and pass an inline <code>onSubmit</code> handler.
        Call <code>mount(container)</code> to render the form. The submitted values are shown below.
      </p>
    </div>
  `;

  const pageContent = container.querySelector('.page-content')!;
  await form.mount(pageContent as HTMLElement);
  pageContent.appendChild(resultBox);
}
