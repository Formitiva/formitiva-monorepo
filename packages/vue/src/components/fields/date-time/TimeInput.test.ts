// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TimeInput from './TimeInput.vue';
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
  return { name: 'startTime', displayName: 'Start Time', type: 'time', ...overrides } as DefinitionPropertyField;
}

describe('TimeInput (Vue)', () => {
  it('renders an input[type="time"]', () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField(), value: '09:00' },
      global: globalProvide,
    });
    expect(wrapper.find('input[type="time"]').exists()).toBe(true);
  });

  it('sets the input id to field.name', () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField({ name: 'alarmTime' }), value: '09:00' },
      global: globalProvide,
    });
    expect(wrapper.find('#alarmTime').exists()).toBe(true);
  });

  it('renders a label containing field.displayName', () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField({ displayName: 'Alarm Time' }), value: '09:00' },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Alarm Time');
  });

  it('sets defaultValue from value prop', () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField(), value: '14:30' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.value || input.defaultValue).toContain('14:30');
  });

  it('emits "change" event when user changes time', async () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField(), value: '09:00' },
      global: globalProvide,
    });
    await wrapper.find('input').setValue('10:30');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual(['10:30']);
  });

  it('step is 1 when includeSeconds is true', () => {
    const wrapper = mount(TimeInput, {
      props: { field: makeField({ includeSeconds: true } as any), value: '09:00' },
      global: globalProvide,
    });
    const input = wrapper.find('input').element as HTMLInputElement;
    expect(input.step).toBe('1');
  });
});
