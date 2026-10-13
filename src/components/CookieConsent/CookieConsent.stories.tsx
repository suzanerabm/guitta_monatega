import type { Meta, StoryObj } from '@storybook/react';
import { CookieConsent } from './CookieConsent';

const meta: Meta<typeof CookieConsent> = {
  title: 'Layout/CookieConsent',
  component: CookieConsent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CookieConsent>;

export const Default: Story = {
  args: {
    privacyPath: '/pt/privacy',
    copy: {
      title: 'Sua privacidade',
      description: 'Você escolhe se autoriza as métricas opcionais deste site.',
      essentialLabel: 'Essenciais',
      essentialDescription: 'Mantêm o site e sua preferência funcionando.',
      analyticsLabel: 'Análises opcionais',
      analyticsDescription: 'Ajudam a entender visitas e melhorar a experiência.',
      acceptLabel: 'Aceitar análises',
      rejectLabel: 'Recusar',
      privacyLabel: 'Privacidade e termos de uso',
    },
  },
};
