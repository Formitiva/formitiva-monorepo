// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import EmailInput from './EmailInput.vue';
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
  return { name: 'email', displayName: 'Email', type: 'email', ...overrides } as DefinitionPropertyField;
}

describe('EmailInput (Vue)', () => {
  it('renders an input[type="email"]', () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField({ name: 'userEmail' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#userEmail').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField({ displayName: 'Your Email' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Your Email');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField(), value: 'user@example.com' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('user@example.com');
  });

  it('emits "change" event when user types', async () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('test@test.com');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['test@test.com']);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(EmailInput, {
      props: { field: makeField(), value: '', error: 'Invalid email' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
