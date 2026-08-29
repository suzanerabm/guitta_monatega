// src/theme/textStyles.ts
//
// Text styles: reusable typography presets. Prefer these over repeating
// fontSize + fontWeight + letterSpacing + textTransform in every component.
//
// Usage: <Text textStyle="label">...</Text>
import { defineTextStyles } from '@chakra-ui/react';

export const textStyles = defineTextStyles({
  /**
   * Small uppercase label used across the app: CharacterCard legend,
   * SceneStrip caption, hero eyebrow, WorldCard tag, etc.
   * Change the look of every label by editing this one preset.
   */
  label: {
    value: {
      fontFamily: 'heading',
      fontSize: 'label',
      fontWeight: 'semibold',
      letterSpacing: 'wider',
      textTransform: 'uppercase',
      lineHeight: 1.2,
    },
  },
  /**
   * Section/page headings and character/card/planet names (h1-h3 scale).
   * Exo Soft SemiBold — only weight 600 is loaded, so never pair this with
   * fontWeight="bold"/700 (triggers synthetic bold in the browser).
   */
  heading: {
    value: {
      fontFamily: 'heading',
      fontWeight: 'semibold',
    },
  },
});
