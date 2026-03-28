// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RadioInput from './RadioInput.vue';
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

const OPTIONS = [
  { label: 'Red', value: 'red' },
  { label: 'Green', value: 'green' },
  { label: 'Blue', value: 'blue' },
];

function makeField(overrides: Partial<DefinitionPropertyField> = {}): any {
  return { name: 'colour', displayName: 'Colour', type: 'radio', options: OPTIONS, ...overrides } as DefinitionPropertyField;
}

describe('RadioInput (Vue)', () => {
  it('renders one radio per option', () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'red' },
      global: globalProvide,
    });
    expect(wrapper.findAll('input[type="radio"]').length).toBe(3);
  });

  it('checks the radio matching the value prop', () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'green' },
      global: globalProvide,
    });
    const radios = wrapper.findAll('input[type="radio"]');
    const greenRadio = radios.find(r => (r.element as HTMLInputElement).value === 'green');
    expect((greenRadio!.element as HTMLInputElement).checked).toBe(true);
    const redRadio = radios.find(r => (r.element as HTMLInputElement).value === 'red');
    expect((redRadio!.element as HTMLInputElement).checked).toBe(false);
  });

  it('renders option labels', () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'red' },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('Red');
    expect(wrapper.text()).toContain('Green');
    expect(wrapper.text()).toContain('Blue');
  });

  it('all radios share field.name as name attribute', () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField({ name: 'theme' }), value: 'red' },
      global: globalProvide,
    });
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios.every(r => r.attributes('name') === 'theme')).toBe(true);
  });

  it('emits "change" when a radio is clicked', async () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'red' },
      global: globalProvide,
    });
    const blueRadio = wrapper.findAll('input[type="radio"]').find(r => (r.element as HTMLInputElement).value === 'blue')!;
    await blueRadio.trigger('change');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['blue']);
  });

  it('emits "change" on ArrowDown keydown (keyboard navigation)', async () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'red' },
      global: globalProvide,
    });
    const firstRadio = wrapper.findAll('input[type="radio"]')[0];
    await firstRadio.trigger('keydown', { key: 'ArrowDown' });
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['green']);
  });

  it('sets aria-invalid on container when external error provided', () => {
    const wrapper = mount(RadioInput, {
      props: { field: makeField(), value: 'red', error: 'Please pick one' },
      global: globalProvide,
    });
    expect(wrapper.find('[aria-invalid="true"]').exists()).toBe(true);
  });
});
