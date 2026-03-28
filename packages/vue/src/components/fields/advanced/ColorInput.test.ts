// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ColorInput from './ColorInput.vue';
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
  return { name: 'bg', displayName: 'Background', type: 'color', ...overrides } as DefinitionPropertyField;
}

describe('ColorInput (Vue)', () => {
  it('renders a select element with predefined colors', () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField(), value: '#ff0000' },
      global: globalProvide,
    });
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('select id is field.name', () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField({ name: 'theme' }), value: '#ff0000' },
      global: globalProvide,
    });
    expect(wrapper.find('select').element.id).toBe('theme');
  });

  it('renders input[type="color"] with id=field.name+"-color"', () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField({ name: 'theme' }), value: '#ff0000' },
      global: globalProvide,
    });
    const colorInput = wrapper.find('input[type="color"]');
    expect(colorInput.exists()).toBe(true);
    expect(colorInput.element.id).toBe('theme-color');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField({ displayName: 'Theme Color' }), value: '#ff0000' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Theme Color');
  });

  it('select has predefined color options', () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField(), value: '#000000' },
      global: globalProvide,
    });
    const select = wrapper.find('select').element as HTMLSelectElement;
    expect(select.options.length).toBeGreaterThan(0);
  });

  it('does not crash with null value (normalizes to #000000)', () => {
    expect(() =>
      mount(ColorInput, {
        props: { field: makeField(), value: null as any },
        global: globalProvide,
      })
    ).not.toThrow();
  });

  it('emits "change" when select changes', async () => {
    const wrapper = mount(ColorInput, {
      props: { field: makeField(), value: '#000000' },
      global: globalProvide,
    });
    await wrapper.find('select').setValue('#ffffff');
    expect(wrapper.emitted('change')).toBeTruthy();
  });
});
