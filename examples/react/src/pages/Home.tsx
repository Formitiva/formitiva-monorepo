/**
 * Home.tsx — Basic / Quick Start Example
 *
 * Demonstrates the simplest way to use @formitiva/react:
 * 1. Import the Formitiva component
 * 2. Define a definition object inline
 * 3. Pass an onSubmit handler as a prop
 */
import { useState } from 'react';
import { Formitiva } from '@formitiva/react';
import type { FormSubmissionHandler } from '@formitiva/react';
import '@formitiva/core/themes/material-dark.css';

const definition = {
  name: 'contactForm',
  version: '1.0.0',
  displayName: 'Contact Form',
  properties: [
    { name: 'fullName',  displayName: 'Full Name',          type: 'text',      defaultValue: '', required: true },
    { name: 'email',     displayName: 'Email',               type: 'email',     defaultValue: '', tooltip: 'We will never share your email with anyone else.' },
    { name: 'subject',   displayName: 'Subject',             type: 'text',      defaultValue: '' },
    { name: 'message',   displayName: 'Message',             type: 'multiline', defaultValue: '' },
    { name: 'length',    displayName: 'Message Length',      type: 'unit',      dimension: 'length', defaultValue: 6, defaultUnit: 'cm' },
    { name: 'slider',    displayName: 'Slider',              type: 'slider',    defaultValue: '',    min: 0, max: 100 },
    { name: 'color_1',   displayName: 'Background Color',    type: 'color',     defaultValue: '' },
  ],
};

export default function Home() {
  const [lastSubmission, setLastSubmission] = useState('');

  const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    setLastSubmission(JSON.stringify(values, null, 2));
    return undefined; // no errors → form submitted successfully
  };

  return (
    <div className="page-content">
      <h2>Basic / Quick Start</h2>
      <p className="desc">
        The simplest integration: import <code>Formitiva</code>, supply a definition object,
        and pass an inline <code>onSubmit</code> handler. The submitted values are shown below.
      </p>

      <Formitiva
        definitionData={definition}
        onSubmit={handleSubmit}
        displayInstanceName={false}
      />

      {lastSubmission && (
        <div className="result-box success">{lastSubmission}</div>
      )}
    </div>
  );
}
