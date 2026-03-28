import * as React from "react";
import useFormitivaContext from "../../../hooks/useFormitivaContext";
import { CSS_CLASSES } from '@formitiva/core';

interface DescriptionProps {
  field: {
    displayText?: string | string[]; // Can be a string or an array of strings for multiple lines
    textAlign?: "left" | "center" | "right";
    allowHtml?: boolean; // if true, displayText is treated as HTML and rendered with dangerouslySetInnerHTML
  };
}

/**
 * Description component for displaying text content in forms
 * This is a UI-only component (not an input) used to show descriptive text
 * Similar to Image component, but for text display
 * 
 * @example
 * // JSON definition:
 * {
 *   "name": "welcomeMessage",
 *   "type": "description",
 *   "displayText": "Welcome to our form! Please fill out all required fields.",
 *   "textAlign": "center",
 *   "allowHtml": false
 * }
 */
const Description: React.FC<DescriptionProps> = ({ field }) => {
  const { t } = useFormitivaContext();
  
  const { displayText = "", textAlign = "left", allowHtml = false } = field;

  const translated = React.useMemo(() => {
    if (Array.isArray(displayText)) {
      const mapped = displayText.map((d) => t(d));
      return allowHtml ? mapped.join("") : mapped.join("\n");
    }
    return t(displayText as string);
  }, [t, displayText, allowHtml]);

  const lines = React.useMemo<string[]>(() => {
    if (allowHtml) return []; // If HTML is allowed, we won't split into lines since it will be rendered as HTML
    const raw = translated.split(/\r\n|\r|\n/);
    return raw.map((line) =>
      line === ""
        ? ""
        : line.replace(/\t/g, "\u00A0\u00A0\u00A0\u00A0").replace(/ /g, "\u00A0")
    );
  }, [translated, allowHtml]);

  if (allowHtml) {
    return (
      <div
        className={CSS_CLASSES.description}
        style={{ textAlign }}
        dangerouslySetInnerHTML={{ __html: translated }}
      />
    );
  }

  return (
    <div className={CSS_CLASSES.description} style={{ textAlign }}>
      {lines.map((line, i) => {
        if (line === "") return <div key={i}><br /></div>;
        return <div key={i}>{line}</div>;
      })}
    </div>
  );
};

Description.displayName = "Description";
export default React.memo(Description);
