import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { KammaraAppBanner } from './KammaraAppBanner';
import { palettes } from '@/theme/palettes';
import { worldCrestGlyph } from '@/theme/kalunGlyphs';

const meta: Meta<typeof KammaraAppBanner> = {
  title: 'Kammara/KammaraAppBanner',
  component: KammaraAppBanner,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <Box bg="darkBg" padding={{ base: '25px', md: '2rem', xl: '3rem' }} minH="100vh">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KammaraAppBanner>;

export const LunnP1: Story = {
  args: {
    worldName: "LUNN'P1",
    eyebrow: 'Aplicativo Kammara',
    title: 'Quer explorar Kammara em maior profundidade?',
    description: [
      '**Kammara vai muito além do que você vê aqui.**',
      'Para curiosos, exploradores e quem quiser mergulhar mais fundo em seus mundos, personagens e conexões, o app Kammara abre uma nova camada do universo.',
      '**Baixe gratuitamente na App Store e no Google Play.**',
    ],
    image: 'https://kammara.s3.us-east-1.amazonaws.com/kammara/app/home_app-v1.png',
    iconImage: 'https://kammara.s3.us-east-1.amazonaws.com/kammara/app/kammara_app_icon-v1.png',
    crestGlyph: worldCrestGlyph('lunnp1'),
    color: palettes.lunnp1.colors[0],
    darkColor: palettes.lunnp1.dark,
    stores: [
      { id: 'apple', label: 'App Store', url: '' },
      { id: 'android', label: 'Google Play', url: '' },
    ],
  },
};

export const WithStoreLinks: Story = {
  args: {
    ...LunnP1.args,
    stores: [
      { id: 'apple', label: 'App Store', url: 'https://apps.apple.com/' },
      { id: 'android', label: 'Google Play', url: 'https://play.google.com/store/apps/' },
    ],
  },
};
