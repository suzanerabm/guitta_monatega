import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const toggleStyles = `
  <style>
    .lang-toggle {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #999;
      text-decoration: none;
      border: 1px solid currentColor;
      border-radius: 3px;
      padding: 0.25rem 0.6rem;
      transition: all 0.2s;
      display: inline-block;
    }
    .lang-toggle:hover {
      color: #1a1d21;
      border-color: #1a1d21;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/LanguageToggle',
};
export default meta;
type Story = StoryObj;

export const ShowEnglish: Story = {
  render: () => `
    ${fontsLink}
    ${toggleStyles}
    <div style="padding: 2rem; font-family: 'Fira Sans', system-ui, sans-serif;">
      <p style="font-size: 0.75rem; color: #999; margin-bottom: 1rem;">Current locale: pt-BR &mdash; clicking switches to English</p>
      <a href="/en/about" class="lang-toggle">PT</a>
    </div>
  `,
};

export const ShowPortuguese: Story = {
  render: () => `
    ${fontsLink}
    ${toggleStyles}
    <div style="padding: 2rem; font-family: 'Fira Sans', system-ui, sans-serif;">
      <p style="font-size: 0.75rem; color: #999; margin-bottom: 1rem;">Current locale: en &mdash; clicking switches to Portuguese</p>
      <a href="/about" class="lang-toggle">EN</a>
    </div>
  `,
};
