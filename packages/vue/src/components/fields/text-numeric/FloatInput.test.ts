// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FloatInput from './FloatInput.vue';
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
  return { name: 'price', displayName: 'Price', type: 'float', ...overrides } as DefinitionPropertyField;
}

describe('FloatInput (Vue)', () => {
  it('renders an input[type="text"]', () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField({ name: 'myFloat' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#myFloat').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField({ displayName: 'Amount' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Amount');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField(), value: 3.14 },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('3.14');
  });

  it('emits "change" event when user inputs text', async () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('1.5');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['1.5']);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(FloatInput, {
      props: { field: makeField(), value: '', error: 'Invalid' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
