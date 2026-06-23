import * as React from 'react';
import type { LayoutSection } from '@formitiva/core';
import type { ReactLayoutAdapterProps } from '../../core/registries/layoutAdapterRegistry';
import { NavLayout } from './NavLayout';
import { TabLayout } from './TabLayout';
import { WizardLayout } from './WizardLayout';

/**
 * The built-in React layout adapter component.
 *
 * Registered via `formitivaLayoutPlugin` -manages the active section state
 * and renders the appropriate layout chrome (nav / tab / wizard) around the
 * field content provided by the renderer.
 */
export const LayoutAdapter: React.FC<ReactLayoutAdapterProps> = ({
  layout,
  renderFields,
  renderSubmit,
  hasErrorsInFields,
  t,
}) => {
  const getDefaultSection = React.useCallback(() => {
    if (layout.type === 'nav') return layout.sections[0]?.name ?? '';
    if (layout.type === 'tab') return layout.sections[0]?.name ?? '';
    if (layout.type === 'wizard') return layout.sections[0]?.name ?? '';
    return '';
  }, [layout]);

  const [activeSection, setActiveSection] = React.useState(
    () => layout.defaultValue || getDefaultSection(),
  );

  React.useEffect(() => {
    const sectionNames = layout.sections.map((section: LayoutSection) => section.name);
    const nextDefault = layout.defaultValue || getDefaultSection();

    setActiveSection((current) => (
      sectionNames.includes(current) ? current : nextDefault
    ));
  }, [getDefaultSection, layout]);

  const getSectionFields = (): string[] | undefined => {
    if (layout.type === 'nav')
      return layout.sections.find((n: LayoutSection) => n.name === activeSection)?.props;
    if (layout.type === 'tab')
      return layout.sections.find((n: LayoutSection) => n.name === activeSection)?.props;
    if (layout.type === 'wizard')
      return layout.sections.find((n: LayoutSection) => n.name === activeSection)?.props;
    return undefined;
  };

  const sectionFields = getSectionFields();

  if (layout.type === 'nav') {
    return (
      <>
        <NavLayout
          config={layout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        >
          {renderFields(sectionFields)}
        </NavLayout>
        {renderSubmit()}
      </>
    );
  }

  if (layout.type === 'tab') {
    return (
      <>
        <TabLayout
          config={layout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        >
          {renderFields(sectionFields)}
        </TabLayout>
        {renderSubmit()}
      </>
    );
  }

  if (layout.type === 'wizard') {
    const hasActiveSectionErrors = hasErrorsInFields(sectionFields);
    return (
      <>
        <WizardLayout
          config={layout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isNextDisabled={hasActiveSectionErrors}
          t={t}
          renderSubmit={renderSubmit}
        >
          {renderFields(sectionFields)}
        </WizardLayout>
      </>
    );
  }

  return null;
};

export default LayoutAdapter;
