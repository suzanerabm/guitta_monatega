import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';
import { NextIntlClientProvider } from 'next-intl';

const meta: Meta<typeof Header> = {
  title: 'Layout/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="pt" messages={{}}>
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: { homePath: '/pt' },
};

export const Transparent: Story = {
  args: { homePath: '/pt', transparent: true },
};
