// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Description from './Description.vue';
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

describe('Description (Vue)', () => {
  it('renders without errors', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: 'Hello' } },
      global: globalProvide,
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('renders plain text content', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: 'Welcome to the form' } },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('Welcome to the form');
  });

  it('applies textAlign="center" style', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: 'Centred', textAlign: 'center' } },
      global: globalProvide,
    });
    const inner = wrapper.find('[style]');
    expect(inner.attributes('style')).toContain('center');
  });

  it('renders array of strings', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: ['First line', 'Second line'] } },
      global: globalProvide,
    });
    expect(wrapper.text()).toContain('First line');
    expect(wrapper.text()).toContain('Second line');
  });

  it('renders HTML when allowHtml=true', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: '<strong>Bold</strong>', allowHtml: true } },
      global: globalProvide,
    });
    expect(wrapper.find('strong').exists()).toBe(true);
  });

  it('does not render HTML tags when allowHtml is false', () => {
    const wrapper = mount(Description, {
      props: { field: { displayText: '<em>Italic</em>', allowHtml: false } },
      global: globalProvide,
    });
    expect(wrapper.find('em').exists()).toBe(false);
  });

  it('calls t() on the display text', () => {
    const tFn = (s: string) => `[${s}]`;
    const ctx: FormitivaContextType = { ...mockCtx, t: tFn };
    const wrapper = mount(Description, {
      props: { field: { displayText: 'Greet' } },
      global: { provide: { [FormitivaContextKey as symbol]: ctx } },
    });
    expect(wrapper.text()).toContain('[Greet]');
  });
});
