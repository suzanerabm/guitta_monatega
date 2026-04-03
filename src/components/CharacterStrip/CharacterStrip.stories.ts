import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">';

const stripStyles = `
  <style>
    .strip-stage {
      position: relative;
      width: 100%;
      min-height: 400px;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .strip-stage-label {
      position: absolute;
      left: 2rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.8rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }
    .char-strip {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50%;
      height: auto;
      z-index: 2;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    }
    .char-strip-right { right: 0; }
    .char-strip-left { left: 0; }
    .char-strip-track {
      display: flex;
      gap: 1rem;
      padding: 1rem 2rem;
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-snap-type: x mandatory;
    }
    .char-strip-track::-webkit-scrollbar { display: none; }

    /* Card styles (inlined) */
    .char-card {
      flex-shrink: 0;
      width: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      scroll-snap-align: center;
    }
    .char-card-glow {
      position: absolute;
      top: 10px; left: 10px; right: 10px; bottom: 20px;
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

const charCard = (name: string, gradient: string) => `
  <div class="char-card">
    <div class="char-card-glow" style="background: ${gradient};"></div>
    <div class="char-card-img-wrap">
      <div class="char-card-img-placeholder" style="background: ${gradient};"></div>
    </div>
    <span class="char-card-name">${name}</span>
  </div>
`;

const meta: Meta = {
  title: 'Components/CharacterStrip',
};
export default meta;
type Story = StoryObj;

const napCatGradient = 'linear-gradient(135deg, #667eea, #764ba2, #f093fb)';
const zecoGradient = 'linear-gradient(135deg, #ff8c42, #ff6b35, #ffa751)';

const napCatNames = ['NapCat', 'Violeta', 'Soneca', 'Miau'];
const zecoNames = ['Zeco', 'Folha', 'Raiz', 'Broto', 'Semente'];

export const NapCatStrip: Story = {
  render: () => `
    ${fontsLink}
    ${stripStyles}
    <div class="strip-stage" style="background: linear-gradient(160deg, #1a1432 0%, #2a1f4a 40%, #1e1638 100%);">
      <span class="strip-stage-label">[ banner napcat ]</span>
      <div class="char-strip char-strip-right">
        <div class="char-strip-track">
          ${napCatNames.map(n => charCard(n, napCatGradient)).join('')}
        </div>
      </div>
    </div>
  `,
};

export const ZecoStrip: Story = {
  render: () => `
    ${fontsLink}
    ${stripStyles}
    <div class="strip-stage" style="background: linear-gradient(160deg, #2a1a0a 0%, #3a2510 40%, #2e1c08 100%);">
      <span class="strip-stage-label">[ banner zeco ]</span>
      <div class="char-strip char-strip-right">
        <div class="char-strip-track">
          ${zecoNames.map(n => charCard(n, zecoGradient)).join('')}
        </div>
      </div>
    </div>
  `,
};
