// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IntegerArrayInput from './IntegerArrayInput.vue';
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
  return { name: 'nums', displayName: 'Numbers', type: 'integer-array', ...overrides } as DefinitionPropertyField;
}

describe('IntegerArrayInput (Vue)', () => {
  it('renders an input[type="text"]', () => {
    const wrapper = mount(IntegerArrayInput, {
      props: { field: makeField(), value: [1, 2, 3] },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="text"]').exists()).toBe(true);
  });

  it('input id is field.name', () => {
    const wrapper = mount(IntegerArrayInput, {
      props: { field: makeField({ name: 'items' }), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('input').element.id).toBe('items');
  });

  it('displays array values as comma-separated string', () => {
    const wrapper = mount(IntegerArrayInput, {
      props: { field: makeField(), value: [1, 2, 3] },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.defaultValue).toBe('1, 2, 3');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(IntegerArrayInput, {
      props: { field: makeField({ displayName: 'Tags' }), value: [] },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Tags');
  });

  it('does not crash with empty array', () => {
    expect(() =>
      mount(IntegerArrayInput, {
        props: { field: makeField(), value: [] },
        global: globalProvide,
      })
    ).not.toThrow();
  });

  it('emits "change" when input value changes', async () => {
    const wrapper = mount(IntegerArrayInput, {
      props: { field: makeField(), value: [1, 2] },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('1, 2, 3');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
