import type { Meta, StoryObj } from '@storybook/react';
import { LanguageToggle } from './LanguageToggle';
import { NextIntlClientProvider } from 'next-intl';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Layout/LanguageToggle',
  component: LanguageToggle,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="pt" messages={{}}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LanguageToggle>;

export const Default: Story = {
  args: { currentPath: '/pt' },
};
