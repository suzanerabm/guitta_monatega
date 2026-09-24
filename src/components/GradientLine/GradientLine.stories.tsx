import type { Meta, StoryObj } from '@storybook/react';
import { GradientLine } from './GradientLine';

const meta: Meta<typeof GradientLine> = { title: 'Components/GradientLine', component: GradientLine, tags: ['autodocs'] };
export default meta;
type Story = StoryObj<typeof GradientLine>;
export const Default: Story = { args: { color: 'orange', width: '72px' } };
