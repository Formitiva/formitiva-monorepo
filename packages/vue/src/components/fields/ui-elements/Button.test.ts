// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';
import { FormitivaContextKey } from '../../../hooks/useFormitivaContext';
import { CSS_CLASSES } from '@formitiva/core';
import type { FormitivaContextType, DefinitionPropertyField } from '@formitiva/core';

const mockCtx: FormitivaContextType = {
  definitionName: '',
  language: 'en',
  theme: 'light',
  formStyle: { container: {}, titleStyle: {} },
  fieldStyle: {},
  t: (s: string) => s,
  fieldValidationMode: 'onSubmission',
  displayInstanceName: false,
};

const globalProvide = {
  provide: { [FormitivaContextKey as symbol]: mockCtx },
};

function makeField(overrides: Partial<DefinitionPropertyField> = {}): DefinitionPropertyField {
  return { name: 'submit', displayName: 'Submit', type: 'button', ...overrides } as DefinitionPropertyField;
}

describe('Button (Vue)', () => {
  it('renders a button element', () => {
    const wrapper = mount(Button, {
      props: { field: makeField(), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('button has CSS_CLASSES.button class', () => {
    const wrapper = mount(Button, {
      props: { field: makeField(), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').classes()).toContain(CSS_CLASSES.button);
  });

  it('button text comes from field.displayName', () => {
    const wrapper = mount(Button, {
      props: { field: makeField({ displayName: 'Send Form' }), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').text()).toContain('Send Form');
  });

  it('uses field.buttonText over displayName when provided', () => {
    const wrapper = mount(Button, {
      props: { field: makeField({ buttonText: 'Go!', displayName: 'Submit' } as any), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').text()).toContain('Go!');
  });

  it('aria-label is set from the label text', () => {
    const wrapper = mount(Button, {
      props: { field: makeField({ displayName: 'Send' }), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').attributes('aria-label')).toBe('Send');
  });

  it('aria-busy is false initially', () => {
    const wrapper = mount(Button, {
      props: { field: makeField(), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect(wrapper.find('button').attributes('aria-busy')).toBe('false');
  });

  it('button is not disabled initially', () => {
    const wrapper = mount(Button, {
      props: { field: makeField(), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    expect((wrapper.find('button').element as HTMLButtonElement).disabled).toBe(false);
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(Button, {
      props: { field: makeField({ displayName: 'Confirm' }), value: null, valuesMap: {}, handleChange: vi.fn(), handleError: vi.fn() },
      global: globalProvide,
    });
    const labels = wrapper.findAll('label');
    const hasLabel = labels.some(l => l.text().includes('Confirm'));
    expect(hasLabel).toBe(true);
  });
});
