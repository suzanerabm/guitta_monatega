import type { Meta, StoryObj } from '@storybook/react';
import { Box } from '@chakra-ui/react';
import { DSTextPanel } from './DSTextPanel';

const meta: Meta<typeof DSTextPanel> = {
  title: 'Components/DSTextPanel',
  component: DSTextPanel,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box width="480px" height="500px" bg="#1a1d21" padding="2rem">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DSTextPanel>;

export const Default: Story = {
  render: () => (
    <DSTextPanel>
      <h2>Lunn&apos;p1</h2>
      <p>
        A water world covered in shimmering oceans and green islands. Its
        surface reflects the twin moons in soft turquoise.
      </p>
      <h3>Geography</h3>
      <p>
        Tides shape the rhythm of life across continents made entirely of
        floating reefs and living kelp.
      </p>
      <h3>Inhabitants</h3>
      <p>
        The Bichittos thrive here, weaving songs into the currents that echo
        for thousands of kilometers.
      </p>
    </DSTextPanel>
  ),
};

export const CustomColors: Story = {
  render: () => (
    <DSTextPanel
      titleColor="#ffd5a8"
      subtitleColor="#ffaa66"
      textColor="#ffeedd"
    >
      <h2>Eni-4</h2>
      <h3>Climate</h3>
      <p>An arid world bathed in amber light.</p>
    </DSTextPanel>
  ),
};
