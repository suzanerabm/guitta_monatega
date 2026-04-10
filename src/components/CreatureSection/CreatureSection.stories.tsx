import type { Meta, StoryObj } from '@storybook/react';
import { CreatureSection } from './CreatureSection';

const meta: Meta<typeof CreatureSection> = {
  title: 'Components/CreatureSection',
  component: CreatureSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof CreatureSection>;

export const Default: Story = {
  render: () => (
    <CreatureSection
      gradient="linear-gradient(135deg, #1a1432, #2a1f4a)"
      accentColor="#667eea"
    >
      <div style={{ padding: '4rem', color: 'white' }}>Content here</div>
    </CreatureSection>
  ),
};

export const WithBgImage: Story = {
  render: () => (
    <CreatureSection
      gradient="linear-gradient(135deg, #1a1432, #2a1f4a)"
      accentColor="#667eea"
      bgImage="/imgs/characters/kammara/lunnp1/_scenes/regiao_leste_aerea.jpg"
    >
      <div style={{ padding: '4rem', color: 'white' }}>With background image</div>
    </CreatureSection>
  ),
};

export const NoParallax: Story = {
  render: () => (
    <CreatureSection
      gradient="linear-gradient(135deg, #2a1f4a, #4a2f6a)"
      noParallax
    >
      <div style={{ padding: '4rem', color: 'white' }}>Static (no parallax)</div>
    </CreatureSection>
  ),
};
