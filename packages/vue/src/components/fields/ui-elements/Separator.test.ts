// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Separator from './Separator.vue';
import { FormitivaContextKey } from '../../../hooks/useFormitivaContext';
import type { FormitivaContextType } from '@formitiva/core';

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

describe('Separator (Vue)', () => {
  it('renders a div element', () => {
    const wrapper = mount(Separator, {
      props: { field: {} },
      global: globalProvide,
    });
    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('has height 0 style', () => {
    const wrapper = mount(Separator, {
      props: { field: {} },
      global: globalProvide,
    });
    const style = wrapper.find('div').attributes('style') ?? '';
    expect(style).toContain('height: 0');
  });

  it('applies custom color in borderTop style', () => {
    const wrapper = mount(Separator, {
      props: { field: { color: 'red', thickness: 1 } },
      global: globalProvide,
    });
    const style = wrapper.find('div').attributes('style') ?? '';
    expect(style).toContain('red');
  });

  it('applies custom thickness in borderTop style', () => {
    const wrapper = mount(Separator, {
      props: { field: { thickness: 3, color: '#000' } },
      global: globalProvide,
    });
    const style = wrapper.find('div').attributes('style') ?? '';
    expect(style).toContain('3px');
  });

  it('uses default light-theme color #CCCCCC', () => {
    const wrapper = mount(Separator, {
      props: { field: {} },
      global: globalProvide,
    });
    const style = wrapper.find('div').attributes('style') ?? '';
    expect(style.toLowerCase()).toContain('cccccc');
  });

  it('applies custom margin', () => {
    const wrapper = mount(Separator, {
      props: { field: { margin: '20px 0' } },
      global: globalProvide,
    });
    const style = wrapper.find('div').attributes('style') ?? '';
    expect(style).toContain('20px');
  });
});
