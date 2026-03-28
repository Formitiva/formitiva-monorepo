// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TextInput from './TextInput.vue';
import { FormitivaContextKey } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType } from '@formitiva/core';
import type { DefinitionPropertyField } from '@formitiva/core';

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
  return { name: 'title', displayName: 'Title', type: 'string', ...overrides } as DefinitionPropertyField;
}

describe('TextInput (Vue)', () => {
  it('renders an input element', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders an input[type="text"]', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField({ name: 'myField' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#myField').exists()).toBe(true);
  });

  it('sets placeholder from field.placeholder', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField({ placeholder: 'Enter value' }), value: '' },
      global: globalProvide,
    });
    expect((wrapper.find('input').element as HTMLInputElement).placeholder).toBe('Enter value');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField(), value: 'initial text' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    // uncontrolled input: defaultValue or value should match
    expect(input.value || input.defaultValue).toContain('initial text');
  });

  it('renders a label containing the display name', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField({ displayName: 'My Label' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('My Label');
  });

  it('emits "change" event when user inputs text', async () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    const input = wrapper.find('input');
    await input.setValue('new value');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['new value']);
  });

  it('emits "error" event on blur with required+empty in onEdit mode', async () => {
    const editCtx: FormitivaContextType = { ...mockCtx, fieldValidationMode: 'onEdit' };
    const wrapper = mount(TextInput, {
      props: { field: makeField({ required: true }), value: '' },
      global: {
        provide: { [FormitivaContextKey as symbol]: editCtx },
      },
    });
    const input = wrapper.find('input');
    await input.trigger('blur');
    expect(wrapper.emitted('error')).toBeTruthy();
    const errorPayload = wrapper.emitted('error')![0]![0];
    expect(typeof errorPayload === 'string' && errorPayload.length > 0).toBe(true);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(TextInput, {
      props: { field: makeField(), value: '', error: 'Field is required' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
