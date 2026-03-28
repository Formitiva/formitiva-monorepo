// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import MultilineTextInput from './MultilineTextInput.vue';
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
  return { name: 'bio', displayName: 'Biography', type: 'multiline', ...overrides } as DefinitionPropertyField;
}

describe('MultilineTextInput (Vue)', () => {
  it('renders a textarea element', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('textarea').exists()).toBe(true);
  });

  it('sets textarea id to field.name', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField({ name: 'notes' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('textarea').attributes('id')).toBe('notes');
  });

  it('renders a label with field.displayName', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField({ displayName: 'Your notes' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Your notes');
  });

  it('applies resize:vertical style', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('textarea').attributes('style')).toContain('vertical');
  });

  it('applies minHeight from field.minHeight', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField({ minHeight: '150px' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('textarea').attributes('style')).toContain('150px');
  });

  it('emits "change" when user types', async () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('textarea').setValue('Hello world');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['Hello world']);
  });

  it('sets aria-invalid="true" when external error provided', () => {
    const wrapper = mount(MultilineTextInput, {
      props: { field: makeField(), value: '', error: 'Required' },
      global: globalProvide,
    });
    expect(wrapper.find('textarea').attributes('aria-invalid')).toBe('true');
  });
});
