import { useState } from 'react';
import { Formitiva } from '@formitiva/react';
import type { FormSubmissionHandler } from '@formitiva/react';
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

export default function Themes() {
  const [theme, setTheme] = useState('light');
  const [lastSubmission, setLastSubmission] = useState('');

  const handleSubmit: FormSubmissionHandler = (_def, _instanceName, values, _t) => {
    setLastSubmission(JSON.stringify(values, null, 2));
    return undefined;
  };

  return (
    <div className="page-content">
      <h2>Theme Demo</h2>
      <p className="desc">Select a theme to preview how Formitiva renders with different themes.</p>

      <div className="lang-selector">
        <label htmlFor="theme">Theme:</label>
        <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light (default)</option>
          <option value="material">Material</option>
          <option value="material-dark">Material Dark</option>
        </select>
      </div>

      <div data-formitiva-theme={theme}>
        <Formitiva definitionData={definition} onSubmit={handleSubmit} displayInstanceName={false} />
      </div>

      {lastSubmission && <div className="result-box success">{lastSubmission}</div>}
    </div>
  );
}
