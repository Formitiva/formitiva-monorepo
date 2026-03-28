// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CheckboxInput from './CheckboxInput.vue';
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
  return { name: 'agree', displayName: 'I Agree', type: 'checkbox', ...overrides } as DefinitionPropertyField;
}

describe('CheckboxInput (Vue)', () => {
  it('renders a checkbox input', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('sets initial checked state to false', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(false);
  });

  it('sets initial checked state to true', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: true },
      global: globalProvide,
    });
    expect((wrapper.find('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField({ name: 'terms' }), value: false },
      global: globalProvide,
    });
    expect(wrapper.find('#terms').exists()).toBe(true);
  });

  it('emits "change" with true when checkbox is checked', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]');
    await input.setValue(true);
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([true]);
  });

  it('emits "change" with false when checkbox is unchecked', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: true },
      global: globalProvide,
    });
    const input = wrapper.find<HTMLInputElement>('input[type="checkbox"]');
    await input.setValue(false);
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([false]);
  });

  it('emits "change" on Space keydown', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('keydown', { key: ' ' });
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([true]);
  });

  it('emits "change" on Enter keydown', async () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false },
      global: globalProvide,
    });
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([true]);
  });

  it('renders a label with the display name', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField({ displayName: 'Accept Terms' }), value: false },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('Accept Terms');
  });

  it('sets aria-invalid="true" when an external error prop is provided', () => {
    const wrapper = mount(CheckboxInput, {
      props: { field: makeField(), value: false, error: 'You must accept the terms' },
      global: globalProvide,
    });
    const input = wrapper.find('input[type="checkbox"]');
    expect(input.attributes('aria-invalid')).toBe('true');
  });
});
