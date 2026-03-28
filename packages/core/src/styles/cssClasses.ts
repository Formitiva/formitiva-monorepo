export const CSS_CLASSES = {
  field: 'formitiva-field',
  label: 'formitiva-label',
  input: 'formitiva-input',
  textInput: 'formitiva-input--text',
  inputNumber: 'formitiva-input--number',
  inputSelect: 'formitiva-select',
  rangeInput: 'formitiva-input--range',
  button: 'formitiva-button',
  description: 'formitiva-description',
  error: 'formitiva-error',
} as const;

export const combineClasses = (
  ...classes: (string | undefined | null | false | Record<string, boolean>)[]
): string => {
  const result: string[] = [];
  for (const cls of classes) {
    if (!cls) continue;
    if (typeof cls === 'string') result.push(cls);
    else if (typeof cls === 'object') {
      Object.entries(cls).forEach(([className, condition]) => {
        if (condition) result.push(className);
      });
    }
  }
  return result.join(' ');
};
