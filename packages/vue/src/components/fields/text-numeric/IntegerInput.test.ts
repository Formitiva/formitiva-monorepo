// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IntegerInput from './IntegerInput.vue';
import { FormitivaContextKey } from '../../../hooks/useFormitivaContext';
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
  return { name: 'age', displayName: 'Age', type: 'integer', ...overrides } as DefinitionPropertyField;
}

describe('IntegerInput (Vue)', () => {
  it('renders an input[type="text"]', () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField({ name: 'myInt' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#myInt').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField({ displayName: 'Quantity' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Quantity');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField(), value: 42 },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('42');
  });

  it('emits "change" event when user inputs text', async () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('10');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['10']);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(IntegerInput, {
      props: { field: makeField(), value: '', error: 'Required' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
