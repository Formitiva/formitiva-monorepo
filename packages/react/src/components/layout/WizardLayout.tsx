import * as React from 'react';
import type { LayoutConfig, LayoutSection } from '@formitiva/core';

export interface WizardLayoutProps {
  config: LayoutConfig;
  activeSection: string;
  onSectionChange: (name: string) => void;
  isNextDisabled?: boolean;
  children: React.ReactNode;
  t: (key: string) => string;
  renderSubmit?: () => React.ReactNode;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  config,
  activeSection,
  onSectionChange,
  isNextDisabled = false,
  children,
  t,
  renderSubmit,
}) => {
  const steps = config.sections as LayoutSection[];
  const currentIndex = Math.max(0, steps.findIndex((s) => s.name === activeSection));
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;
  const nextDisabled = isLast || isNextDisabled;

  const goNext = () => {
    if (!nextDisabled && steps[currentIndex + 1]) onSectionChange(steps[currentIndex + 1].name);
  };

  const goPrev = () => {
    if (!isFirst && steps[currentIndex - 1]) onSectionChange(steps[currentIndex - 1].name);
  };

  return (
    <div>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '0' }}
        aria-label={config.displayName}
      >
        {steps.map((step: LayoutSection, index: number) => {
          const isActive = step.name === activeSection;
          const isDone = index < currentIndex;
          return (
            <React.Fragment key={step.name}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8em',
                    fontWeight: '600',
                    background: isDone
                      ? 'var(--formitiva-wizard-done-bg, #34a853)'
                      : isActive
                        ? 'var(--formitiva-wizard-active-bg, #1a73e8)'
                        : 'var(--formitiva-wizard-inactive-bg, #e0e0e0)',
                    color: isDone || isActive ? '#fff' : 'var(--formitiva-text-muted, #666)',
                  }}
                >
                  {isDone ? '\u2713' : index + 1}
                </div>
                <span
                  style={{
                    fontSize: '0.75em',
                    color: isActive
                      ? 'var(--formitiva-wizard-active-color, #1a73e8)'
                      : 'var(--formitiva-text-muted, #666)',
                    fontWeight: isActive ? '600' : 'normal',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    background: isDone
                      ? 'var(--formitiva-wizard-done-bg, #34a853)'
                      : 'var(--formitiva-border, #d1d5db)',
                    margin: '0 4px',
                    marginBottom: '20px',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ marginBottom: '16px' }}>{children}</div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>{renderSubmit ? renderSubmit() : null}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={isFirst}
            className="formitiva-button"
            style={{ width: '100px' }}
          >
            {t('Previous')}
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={nextDisabled}
            className="formitiva-button"
            style={{ width: '100px' }}
          >
            {t('Next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardLayout;
