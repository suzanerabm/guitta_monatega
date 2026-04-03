import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">';

const cardStyles = `
  <style>
    .card-stage {
      display: flex;
      gap: 3rem;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      min-height: 300px;
      background: #1a1432;
      border-radius: 8px;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .char-card {
      flex-shrink: 0;
      width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }
    .char-card-glow {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      bottom: 20px;
      border-radius: 16px;
      filter: blur(16px);
      opacity: 0.4;
      z-index: 0;
    }
    .char-card-img-wrap {
      width: 120px;
      height: 120px;
      border-radius: 16px;
      overflow: hidden;
      background: #ffffff;
      position: relative;
      z-index: 1;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      outline: 2px solid rgba(255,255,255,0.35);
      outline-offset: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .char-card-img-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
    }
    .char-card-name {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #ffffff;
      font-weight: 400;
      z-index: 1;
      text-shadow: 0 1px 8px rgba(0,0,0,0.3);
    }
  </style>
`;

const charCard = (name: string, gradient: string, placeholderColor: string) => `
  <div class="char-card">
    <div class="char-card-glow" style="background: ${gradient};"></div>
    <div class="char-card-img-wrap">
      <div class="char-card-img-placeholder" style="background: ${gradient};"></div>
    </div>
    <span class="char-card-name">${name}</span>
  </div>
`;

const meta: Meta = {
  title: 'Components/CharacterCard',
};
export default meta;
type Story = StoryObj;

export const NapCat: Story = {
  render: () => `
    ${fontsLink}
    ${cardStyles}
    <div class="card-stage" style="background: #1a1432;">
      ${charCard('NapCat', 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)', '#764ba2')}
    </div>
  `,
};

export const Zeco: Story = {
  render: () => `
    ${fontsLink}
    ${cardStyles}
    <div class="card-stage" style="background: #2a1a0a;">
      ${charCard('Zeco', 'linear-gradient(135deg, #ff8c42, #ff6b35, #ffa751)', '#ff8c42')}
    </div>
  `,
};

export const Taylo: Story = {
  render: () => `
    ${fontsLink}
    ${cardStyles}
    <div class="card-stage" style="background: #2a0a1a;">
      ${charCard('Taylo', 'linear-gradient(135deg, #fc5c7d, #6a82fb, #b06ab3)', '#fc5c7d')}
    </div>
  `,
};
