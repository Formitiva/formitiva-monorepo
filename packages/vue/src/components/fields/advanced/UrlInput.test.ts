// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UrlInput from './UrlInput.vue';
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
  return { name: 'website', displayName: 'Website', type: 'url', ...overrides } as DefinitionPropertyField;
}

describe('UrlInput (Vue)', () => {
  it('renders an input[type="url"]', () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="url"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField({ name: 'homepage' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('#homepage').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField({ displayName: 'Homepage' }), value: '' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Homepage');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField(), value: 'https://example.com' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('https://example.com');
  });

  it('emits "change" event when user types', async () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField(), value: '' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('https://test.com');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['https://test.com']);
  });

  it('marks input as aria-invalid when external error is passed', () => {
    const wrapper = mount(UrlInput, {
      props: { field: makeField(), value: '', error: 'Invalid URL' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
