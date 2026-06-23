import type { LayoutConfig } from '@formitiva/core';
import type { TranslationFunction } from '@formitiva/core';

export interface WizardLayoutResult {
  el: HTMLElement;
  contentEl: HTMLElement;
  /** Slot on the left of the wizard nav row where the submit button should be placed. */
  submitSlot: HTMLElement;
  setNextDisabled(disabled: boolean): void;
  isLastStep(): boolean;
  setSection(name: string): void;
  destroy(): void;
}

export function createWizardLayout(
  config: LayoutConfig,
  initialSection: string,
  onSectionChange: (name: string) => void,
  t: TranslationFunction,
): WizardLayoutResult {
  const steps = config.sections;
  let currentSection = initialSection;
  let currentIndex = Math.max(0, steps.findIndex((s) => s.name === currentSection));
  let nextDisabledByValidation = false;

  const container = document.createElement('div');

  const indicatorsRow = document.createElement('div');
  Object.assign(indicatorsRow.style, {
    display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '0',
  });
  indicatorsRow.setAttribute('aria-label', config.displayName);

  const stepCircles: HTMLElement[] = [];
  const stepLabels: HTMLElement[] = [];
  const stepLines: HTMLElement[] = [];

  steps.forEach((step, index) => {
    const stepWrapper = document.createElement('div');
    Object.assign(stepWrapper.style, {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    });

    const circle = document.createElement('div');
    Object.assign(circle.style, {
      width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '0.8em', fontWeight: '600',
    });
    circle.textContent = String(index + 1);

    const label = document.createElement('span');
    Object.assign(label.style, { fontSize: '0.75em', whiteSpace: 'nowrap' });
    label.textContent = step.label;

    stepCircles.push(circle);
    stepLabels.push(label);
    stepWrapper.appendChild(circle);
    stepWrapper.appendChild(label);
    indicatorsRow.appendChild(stepWrapper);

    if (index < steps.length - 1) {
      const line = document.createElement('div');
      Object.assign(line.style, { flex: '1', height: '2px', margin: '0 4px', marginBottom: '20px' });
      stepLines.push(line);
      indicatorsRow.appendChild(line);
    }
  });

  const updateIndicators = () => {
    steps.forEach((step, index) => {
      const isDone = index < currentIndex;
      const isActive = step.name === currentSection;
      const circle = stepCircles[index];
      const label = stepLabels[index];
      circle.textContent = isDone ? '\u2713' : String(index + 1);
      circle.style.background = isDone
        ? 'var(--formitiva-wizard-done-bg, #34a853)'
        : isActive
        ? 'var(--formitiva-wizard-active-bg, #1a73e8)'
        : 'var(--formitiva-wizard-inactive-bg, #e0e0e0)';
      circle.style.color = isDone || isActive ? '#fff' : 'var(--formitiva-text-muted, #666)';
      label.style.color = isActive
        ? 'var(--formitiva-wizard-active-color, #1a73e8)'
        : 'var(--formitiva-text-muted, #666)';
      label.style.fontWeight = isActive ? '600' : 'normal';
      if (index < steps.length - 1) {
        stepLines[index].style.background = isDone
          ? 'var(--formitiva-wizard-done-bg, #34a853)'
          : 'var(--formitiva-border, #d1d5db)';
      }
    });
  };

  const contentEl = document.createElement('div');
  Object.assign(contentEl.style, { marginBottom: '16px' });

  const navButtons = document.createElement('div');
  Object.assign(navButtons.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '16px',
  });

  // Left side: slot for the submit button (injected by the renderer)
  const submitSlot = document.createElement('div');
  navButtons.appendChild(submitSlot);

  // Right side: Previous + Next always visible; disabled when at boundary
  const rightGroup = document.createElement('div');
  Object.assign(rightGroup.style, { display: 'flex', gap: '8px' });

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'formitiva-button';
  prevBtn.style.width = '100px';
  prevBtn.textContent = t('Previous');
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      setSection(steps[currentIndex - 1].name);
      onSectionChange(steps[currentIndex - 1].name);
    }
  });

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'formitiva-button';
  nextBtn.style.width = '100px';
  nextBtn.textContent = t('Next');
  nextBtn.addEventListener('click', () => {
    if (!nextBtn.disabled && currentIndex < steps.length - 1) {
      setSection(steps[currentIndex + 1].name);
      onSectionChange(steps[currentIndex + 1].name);
    }
  });

  rightGroup.appendChild(prevBtn);
  rightGroup.appendChild(nextBtn);
  navButtons.appendChild(rightGroup);

  const updateNavButtons = () => {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === steps.length - 1 || nextDisabledByValidation;
  };

  const setNextDisabled = (disabled: boolean) => {
    nextDisabledByValidation = disabled;
    updateNavButtons();
  };

  const setSection = (name: string) => {
    currentSection = name;
    currentIndex = Math.max(0, steps.findIndex((s) => s.name === name));
    updateIndicators();
    updateNavButtons();
  };

  updateIndicators();
  updateNavButtons();

  container.appendChild(indicatorsRow);
  container.appendChild(contentEl);
  container.appendChild(navButtons);

  return {
    el: container,
    contentEl,
    submitSlot,
    setNextDisabled,
    isLastStep() { return currentIndex === steps.length - 1; },
    setSection,
    destroy() { /* nothing to clean up */ },
  };
}
