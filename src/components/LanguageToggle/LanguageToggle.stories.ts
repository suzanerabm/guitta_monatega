import type { Meta, StoryObj } from '@storybook/html';
import LanguageToggle from './LanguageToggle.astro';

const meta: Meta<typeof LanguageToggle> = {
  title: 'Components/LanguageToggle',
  component: LanguageToggle,
};
export default meta;
type Story = StoryObj<typeof LanguageToggle>;

export const ShowEnglish: Story = {
  args: {
    locale: 'pt-BR',
    currentPath: '/about',
  },
};

export const ShowPortuguese: Story = {
  args: {
    locale: 'en',
    currentPath: '/about',
  },
};
