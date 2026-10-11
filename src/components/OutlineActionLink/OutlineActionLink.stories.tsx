import type { Meta, StoryObj } from '@storybook/react';
import { OutlineActionLink } from './OutlineActionLink';

const meta: Meta<typeof OutlineActionLink> = {
  title: 'Components/OutlineActionLink',
  component: OutlineActionLink,
};

export default meta;
type Story = StoryObj<typeof OutlineActionLink>;

export const Default: Story = {
  args: {
    href: '/pt/books',
    children: 'Ver todos os livros',
  },
};
