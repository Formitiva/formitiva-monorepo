import * as React from 'react';
import type { LayoutConfig, LayoutSection } from '@formitiva/core';

export interface NavLayoutProps {
  config: LayoutConfig;
  activeSection: string;
  onSectionChange: (name: string) => void;
  children: React.ReactNode;
}

export const NavLayout: React.FC<NavLayoutProps> = ({
  config,
  activeSection,
  onSectionChange,
  children,
}) => {
  return (
    <div style={{ display: 'flex', gap: '0', minHeight: '200px' }}>
      {/* Left nav panel */}
      <nav
        style={{
          minWidth: '160px',
          borderRight: '1px solid var(--formitiva-border, #d1d5db)',
          paddingRight: '0',
          marginRight: '0',
          flexShrink: 0,
        }}
        aria-label={config.displayName}
      >
        {config.sections.map((item: LayoutSection) => {
          const isActive = item.name === activeSection;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSectionChange(item.name)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                background: isActive
                  ? 'var(--formitiva-nav-active-bg, #e8f0fe)'
                  : 'transparent',
                color: isActive
                  ? 'var(--formitiva-nav-active-color, #1a73e8)'
                  : 'var(--formitiva-text, inherit)',
                fontWeight: isActive ? '600' : 'normal',
                border: 'none',
                borderLeft: isActive
                  ? '3px solid var(--formitiva-nav-active-color, #1a73e8)'
                  : '3px solid transparent',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                lineHeight: '1.4',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Right content area */}
      <div style={{ flex: 1, paddingLeft: '16px', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};

export default NavLayout;
