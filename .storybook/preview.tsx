// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../src/theme';
import React from 'react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ChakraProvider value={system}>
        <Story />
      </ChakraProvider>
    ),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
