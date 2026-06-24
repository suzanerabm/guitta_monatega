import type { Meta, StoryObj } from '@storybook/react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { KammaraStatBadge } from './KammaraStatBadge';
import { palettes } from '@/theme/palettes';

const meta: Meta<typeof KammaraStatBadge> = {
  title: 'Kammara/KammaraStatBadge',
  component: KammaraStatBadge,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
};
export default meta;
type Story = StoryObj<typeof KammaraStatBadge>;

const color = palettes.lunnp1.colors[0];
const darkColor = palettes.lunnp1.dark;
const stats = [
  { label: 'Habitantes', value: "Shal'ún" },
  { label: 'Idioma', value: 'Voz Kalún' },
  { label: 'Clima', value: 'Aquático' },
  { label: 'Energia', value: 'Luz' },
];

export const Default: Story = {
  render: () => (
    <Box bg="darkBg" minH="100vh" padding="3rem">
      <Box
        css={{ background: `linear-gradient(135deg, ${darkColor}, #0a3a1e)` }}
        borderRadius="20px"
        padding="1.5rem"
        width="fit-content"
      >
        <Text color={color} fontSize="xs" letterSpacing="hero" textTransform="uppercase" mb="md">
          Tags
        </Text>
        <Flex direction="column" gap="sm">
          {stats.map((s) => (
            <KammaraStatBadge
              key={s.label}
              label={s.label}
              value={s.value}
              color={color}
              darkColor={darkColor}
            />
          ))}
        </Flex>
      </Box>
    </Box>
  ),
};
