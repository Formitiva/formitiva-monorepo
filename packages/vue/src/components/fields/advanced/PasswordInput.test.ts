// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PasswordInput from './PasswordInput.vue';
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
  return { name: 'password', displayName: 'Password', type: 'password', ...overrides } as DefinitionPropertyField;
}

describe('PasswordInput (Vue)', () => {
  it('renders an input[type="password"] by default', () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField({ name: 'secret' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#secret').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField({ displayName: 'Secret Key' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Secret Key');
  });

  it('has a toggle visibility button', () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('toggles to input[type="text"] when toggle button is clicked', async () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('toggles back to input[type="password"] on second button click', async () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('button').trigger('click');
    await wrapper.find('button').trigger('click');
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it('emits "change" event when user types', async () => {
    const wrapper = mount(PasswordInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('secret123');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
