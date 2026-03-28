// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PhoneInput from './PhoneInput.vue';
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
  return { name: 'phone', displayName: 'Phone', type: 'phone', ...overrides } as DefinitionPropertyField;
}

describe('PhoneInput (Vue)', () => {
  it('renders an input[type="tel"]', () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="tel"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField({ name: 'mobile' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#mobile').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField({ displayName: 'Mobile Number' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Mobile Number');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField(), value: '+1-555-1234' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('555-1234');
  });

  it('emits "change" event when user types', async () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('555-1234');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['555-1234']);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(PhoneInput, {
      props: { field: makeField(), value: '', error: 'Invalid phone' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
