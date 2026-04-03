import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const worldStyles = `
  <style>
    .world {
      padding: 5rem 3rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .world-tag {
      font-size: 0.7rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 0.5rem;
      display: block;
    }
    .world-name {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.04em;
      margin-bottom: 0.8rem;
      margin-top: 0.5rem;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .world-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #aaa;
      font-weight: 300;
      max-width: 600px;
    }
    .world-banner {
      width: 100%;
      height: 50vh;
      min-height: 350px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2.5rem;
      border-radius: 4px;
    }
    .world-banner-label {
      font-size: 0.8rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .world-divider {
      width: 40px;
      height: 1px;
      background: rgba(255,255,255,0.08);
      margin: 4rem auto;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/WorldCard',
};
export default meta;
type Story = StoryObj;

export const LunnP1: Story = {
  render: () => `
    ${fontsLink}
    ${worldStyles}
    <div style="background: #111; padding-bottom: 2rem;">
      <div class="world">
        <span class="world-tag">Planeta</span>
        <h2 class="world-name">LUNN'P1</h2>
        <div class="world-text">
          <p>Um planeta oceano coberto por uma atmosfera densa de vapor. Civilizacoes flutuantes habitam suas camadas superiores.</p>
        </div>
      </div>
      <div class="world-banner" style="background: linear-gradient(135deg, #1a3a5c, #2d5f8a, #1a4a6a);">
        <span class="world-banner-label">[ imagem LUNN'P1 ]</span>
      </div>
      <div class="world-divider"></div>
    </div>
  `,
};

export const TripleC: Story = {
  render: () => `
    ${fontsLink}
    ${worldStyles}
    <div style="background: #111; padding-bottom: 2rem;">
      <div class="world">
        <span class="world-tag">Estacao Espacial</span>
        <h2 class="world-name">TripleC</h2>
        <div class="world-text">
          <p>Estacao de transito entre sistemas. Centro de comercio, comunicacao e conexao intergalactica.</p>
        </div>
      </div>
      <div class="world-banner" style="background: linear-gradient(135deg, #1a2a1a, #2a4a2a, #1a3a1a);">
        <span class="world-banner-label">[ imagem TripleC ]</span>
      </div>
    </div>
  `,
};
