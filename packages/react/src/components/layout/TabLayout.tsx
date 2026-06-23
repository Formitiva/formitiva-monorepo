import * as React from 'react';
import type { LayoutConfig, LayoutSection } from '@formitiva/core';

export interface TabLayoutProps {
  config: LayoutConfig;
  activeSection: string;
  onSectionChange: (name: string) => void;
  children: React.ReactNode;
}

export const TabLayout: React.FC<TabLayoutProps> = ({
  config,
  activeSection,
  onSectionChange,
  children,
}) => {
  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label={config.displayName}
        style={{
          display: 'flex',
          borderBottom: '2px solid var(--formitiva-border, #d1d5db)',
          marginBottom: '16px',
          gap: '0',
        }}
      >
        {config.sections.map((item: LayoutSection) => {
          const isActive = item.name === activeSection;
          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSectionChange(item.name)}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive
                  ? '2px solid var(--formitiva-tab-active-color, #1a73e8)'
                  : '2px solid transparent',
                marginBottom: '-2px',
                color: isActive
                  ? 'var(--formitiva-tab-active-color, #1a73e8)'
                  : 'var(--formitiva-text, inherit)',
                fontWeight: isActive ? '600' : 'normal',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Tab panel content */}
      <div role="tabpanel">
        {children}
      </div>
    </div>
  );
};

export default TabLayout;
