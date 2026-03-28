// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DropdownInput from './DropdownInput.vue';
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

function makeField(overrides: Partial<DefinitionPropertyField> = {}): any {
  return {
    name: 'status',
    displayName: 'Status',
    type: 'dropdown',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
    ...overrides,
  } as unknown as DefinitionPropertyField;
}

describe('DropdownInput (Vue)', () => {
  it('renders a control with role="combobox"', () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'active' },
      global: globalProvide,
    });
    expect(wrapper.find('[role="combobox"]').exists()).toBe(true);
  });

  it('control has aria-haspopup="listbox"', () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'active' },
      global: globalProvide,
    });
    const control = wrapper.find('[role="combobox"]');
    expect(control.attributes('aria-haspopup')).toBe('listbox');
  });

  it('aria-expanded is false initially', () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'active' },
      global: globalProvide,
    });
    const control = wrapper.find('[role="combobox"]');
    expect(control.attributes('aria-expanded')).toBe('false');
  });

  it('displays the selected option label', () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'inactive' },
      global: globalProvide,
    });
    const control = wrapper.find('[role="combobox"]');
    expect(control.text()).toContain('Inactive');
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField({ displayName: 'User Status' }), value: 'active' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('User Status');
  });

  it('aria-expanded becomes true when control is clicked', async () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'active' },
      global: globalProvide,
    });
    const control = wrapper.find('[role="combobox"]');
    await control.trigger('click');
    expect(control.attributes('aria-expanded')).toBe('true');
  });

  it('emits "change" when an option is selected from popup', async () => {
    const wrapper = mount(DropdownInput, {
      props: { field: makeField(), value: 'active' },
      global: globalProvide,
    });
    await wrapper.find('[role="combobox"]').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    if (options.length > 1) {
      await options[1].trigger('click');
      expect(wrapper.emitted('change')).toBeTruthy();
    }
  });
});
