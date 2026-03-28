// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import FloatArrayInput from './FloatArrayInput.vue';
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
  return { name: 'floats', displayName: 'Floats', type: 'float-array', ...overrides } as DefinitionPropertyField;
}

describe('FloatArrayInput (Vue)', () => {
  it('renders an input[type="text"]', () => {
    const wrapper = mount(FloatArrayInput, {
      props: { field: makeField(), value: [1.1, 2.2] },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('input id is field.name', () => {
    const wrapper = mount(FloatArrayInput, {
      props: { field: makeField({ name: 'scores' }), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('input').element.id).toBe('scores');
  });

  it('displays float array values as comma-separated string', () => {
    const wrapper = mount(FloatArrayInput, {
      props: { field: makeField(), value: [1.5, 2.5] },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.defaultValue).toBe('1.5, 2.5');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(FloatArrayInput, {
      props: { field: makeField({ displayName: 'Measurements' }), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Measurements');
  });

  it('does not crash with empty array', () => {
    expect(() =>
      mount(FloatArrayInput, {
        props: { field: makeField(), value: [] },
        global: globalProvide,
      })
    ).not.toThrow();
  });

  it('emits "change" when input value changes', async () => {
    const wrapper = mount(FloatArrayInput, {
      props: { field: makeField(), value: [1.5] },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('1.5, 2.5');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
