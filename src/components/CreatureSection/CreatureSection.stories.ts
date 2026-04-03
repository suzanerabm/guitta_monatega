import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;600;700&display=swap" rel="stylesheet">';

const sectionStyles = `
  <style>
    .creature-section {
      position: relative;
      overflow: hidden;
      border-radius: 8px;
    }
    .creature-section-bg {
      position: absolute;
      inset: 0;
      z-index: 0;
    }
    .creature-section-glow {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }
    .creature-section-content {
      position: relative;
      z-index: 1;
      padding: 4rem 3rem;
      max-width: 800px;
      margin: 0 auto;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .creature-name {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.04em;
      margin: 0 0 1.5rem 0;
    }
    .creature-divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 1.5rem 0;
    }
    .creature-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: rgba(255,255,255,0.65);
      font-weight: 300;
      max-width: 600px;
      margin: 0;
    }
    .creature-label {
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-top: 2rem;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/CreatureSection',
};
export default meta;
type Story = StoryObj;

export const NapCat: Story = {
  render: () => `
    ${fontsLink}
    ${sectionStyles}
    <div class="creature-section">
      <div class="creature-section-bg" style="background: linear-gradient(160deg, #1a1432 0%, #2a1f4a 40%, #1e1638 100%);"></div>
      <div class="creature-section-glow" style="background: radial-gradient(ellipse at 30% 20%, rgba(102,126,234,0.08) 0%, transparent 70%);"></div>
      <div class="creature-section-content">
        <h2 class="creature-name">NapCat</h2>
        <p class="creature-text">
          Um gato que dorme 23 horas por dia. Na hora restante, causa o caos absoluto.
          Especialista em derrubar copos e ignorar humanos com estilo.
        </p>
        <div class="creature-divider"></div>
        <p class="creature-text">
          Suas aventuras acontecem nos breves momentos entre um cochilo e outro,
          quando o mundo inteiro vira seu playground.
        </p>
        <div class="creature-label">[ galeria de livros aqui ]</div>
      </div>
    </div>
  `,
};

export const Zeco: Story = {
  render: () => `
    ${fontsLink}
    ${sectionStyles}
    <div class="creature-section">
      <div class="creature-section-bg" style="background: linear-gradient(160deg, #2a1a0a 0%, #3a2510 40%, #2e1c08 100%);"></div>
      <div class="creature-section-glow" style="background: radial-gradient(ellipse at 30% 20%, rgba(255,140,66,0.08) 0%, transparent 70%);"></div>
      <div class="creature-section-content">
        <h2 class="creature-name">Zeco</h2>
        <p class="creature-text">
          Criatura curiosa que vive entre as estacoes. Pequeno, persistente,
          e cheio de perguntas sobre o mundo ao redor.
        </p>
        <div class="creature-divider"></div>
        <p class="creature-text">
          Cada folha que cai, cada brisa que passa, e motivo para uma nova
          aventura na floresta onde ele nasceu.
        </p>
        <div class="creature-label">[ galeria de livros aqui ]</div>
      </div>
    </div>
  `,
};
