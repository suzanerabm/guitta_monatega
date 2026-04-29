import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { useState } from 'react';
import { KammaraRoulette } from './KammaraRoulette';
import type { KammaraRouletteItem } from './KammaraRoulette';

const meta: Meta<typeof KammaraRoulette> = {
  title: 'Kammara/KammaraRoulette',
  component: KammaraRoulette,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <Box
        position="relative"
        width="360px"
        height="360px"
        background="linear-gradient(135deg, #002e14 0%, #003d1a 50%, #002e14 100%)"
        borderRadius="lg"
      >
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraRoulette>;

const sixItems: KammaraRouletteItem[] = [
  { id: 'cultura', icon: '⊙', label: 'Cultura', title: 'Cultura' },
  { id: 'flora', icon: '•', label: 'Flora & Fauna', title: 'Flora & Fauna' },
  { id: 'geografia', icon: '—', label: 'Geografia', title: 'Geografia' },
  { id: 'luas', icon: '⊶⊷', label: 'Ciclos & Luas', title: 'Ciclos & Luas' },
  { id: 'agua', icon: '⋄', label: 'A Água', title: 'A Água' },
  { id: 'idioma', icon: '⊹⊙⊹', label: 'Idioma', title: 'Idioma' },
];

const threeItems: KammaraRouletteItem[] = sixItems.slice(0, 3);

const sevenItems: KammaraRouletteItem[] = [
  ...sixItems,
  { id: 'glifos', icon: '⊹', label: 'Glifos', title: 'Glifos' },
];

const twelveItems: KammaraRouletteItem[] = [
  ...sixItems,
  { id: 'glifos', icon: '⊹', label: 'Glifos', title: 'Glifos' },
  { id: 'povo', icon: '⊙', label: 'Povo', title: 'Povo' },
  { id: 'mitos', icon: '⊹', label: 'Mitos', title: 'Mitos' },
  { id: 'rituais', icon: '⊙', label: 'Rituais', title: 'Rituais' },
  { id: 'alianca', icon: '⊶⊹⊷', label: 'Aliança', title: 'Aliança' },
  { id: 'virus', icon: '⋄⋄⊷', label: 'Vírus', title: 'Vírus' },
];

const Interactive = ({ items }: { items: KammaraRouletteItem[] }) => {
  const [active, setActive] = useState(0);
  return (
    <KammaraRoulette
      items={items}
      activeIndex={active}
      onSelect={setActive}
      color="#00e676"
      darkColor="#002e14"
      cardPaddingX="1.8rem"
    />
  );
};

export const SixItems: Story = {
  render: () => <Interactive items={sixItems} />,
};

export const ThreeItems: Story = {
  render: () => <Interactive items={threeItems} />,
};

export const SevenItems: Story = {
  render: () => <Interactive items={sevenItems} />,
};

export const TwelveItems: Story = {
  render: () => <Interactive items={twelveItems} />,
};
