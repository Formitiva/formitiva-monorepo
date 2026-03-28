// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import UnitValueInput from './UnitValueInput.vue';
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
  return {
    name: 'length',
    displayName: 'Length',
    type: 'unit-value',
    units: ['m', 'cm', 'mm', 'km'],
    defaultUnit: 'm',
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

describe('UnitValueInput (Vue)', () => {
  it('renders an input for numeric value', () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '10', unit: 'm' } },
      global: globalProvide,
    });
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('input id is field.name', () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField({ name: 'dist' }), value: { value: '5', unit: 'm' } },
      global: globalProvide,
    });
    expect(wrapper.find('input').element.id).toBe('dist');
  });

  it('renders a select for unit selection', () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '10', unit: 'm' } },
      global: globalProvide,
    });
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('select contains the unit options from field.units', () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '10', unit: 'm' } },
      global: globalProvide,
    });
    const select = wrapper.find('select').element as HTMLSelectElement;
    expect(select.options.length).toBe(4);
  });

  it('sets input value from value.value', () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '42', unit: 'cm' } },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value).toBe('42');
  });

  it('does not crash with null value', () => {
    expect(() =>
      mount(UnitValueInput, {
        props: { field: makeField(), value: null },
        global: globalProvide,
      })
    ).not.toThrow();
  });

  it('emits "change" when input changes', async () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '10', unit: 'm' } },
      global: globalProvide,
    });
    const input = wrapper.find('input');
    const el = input.element as HTMLInputElement;
    el.value = '20';
    await input.trigger('input');
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('emits "change" when unit select changes', async () => {
    const wrapper = mount(UnitValueInput, {
      props: { field: makeField(), value: { value: '10', unit: 'm' } },
      global: globalProvide,
    });
    await wrapper.find('select').setValue('cm');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
