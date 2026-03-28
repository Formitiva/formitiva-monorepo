// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RatingInput from './RatingInput.vue';
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
  return { name: 'rating', displayName: 'Rating', type: 'rating', max: 5, ...overrides } as DefinitionPropertyField;
}

describe('RatingInput (Vue)', () => {
  it('renders a radiogroup container', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true);
  });

  it('renders max number of stars (default 5)', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.findAll('[role="radio"]').length).toBe(5);
  });

  it('renders correct number of stars when max is custom', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField({ max: 3 } as any), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.findAll('[role="radio"]').length).toBe(3);
  });

  it('each star has aria-label "Rating N"', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    const stars = wrapper.findAll('[role="radio"]');
    expect(stars[0].attributes('aria-label')).toBe('Rating 1');
    expect(stars[4].attributes('aria-label')).toBe('Rating 5');
  });

  it('emits "change" with correct value when a star is clicked', async () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField(), value: 0 },
      global: globalProvide,
    });
    const stars = wrapper.findAll('[role="radio"]');
    await stars[2].trigger('click');
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')![0]).toEqual([3]);
  });

  it('renders a label with displayName', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField({ displayName: 'Quality' }), value: 0 },
      global: globalProvide,
    });
    expect(wrapper.find('label').text()).toContain('Quality');
  });

  it('sets aria-checked=true on stars up to value', () => {
    const wrapper = mount(RatingInput, {
      props: { field: makeField(), value: 3 },
      global: globalProvide,
    });
    const stars = wrapper.findAll('[role="radio"]');
    expect(stars[0].attributes('aria-checked')).toBe('true');
    expect(stars[2].attributes('aria-checked')).toBe('true');
    expect(stars[3].attributes('aria-checked')).toBe('false');
  });
});
