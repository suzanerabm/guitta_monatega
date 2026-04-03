import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const creatureStyles = `
  <style>
    .creature {
      padding: 5rem 3rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .creature-name {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: #1a1d21;
      letter-spacing: 0.04em;
      margin-bottom: 1rem;
      margin-top: 0;
    }
    .creature-text {
      font-size: 1.05rem;
      line-height: 1.7;
      color: #555;
      font-weight: 300;
      max-width: 600px;
    }
    .creature-banner {
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
    .creature-banner-label {
      font-size: 0.8rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/CreatureCard',
};
export default meta;
type Story = StoryObj;

export const NapCat: Story = {
  render: () => `
    ${fontsLink}
    ${creatureStyles}
    <div class="creature">
      <h2 class="creature-name">NapCat</h2>
      <div class="creature-text">
        <p>Um gato que dorme 23 horas por dia. Na hora restante, causa o caos absoluto. Especialista em derrubar copos e ignorar humanos.</p>
      </div>
    </div>
    <div class="creature-banner" style="background: linear-gradient(135deg, #7b68ee, #9b59b6, #e074c0);">
      <span class="creature-banner-label">[ imagem NapCat ]</span>
    </div>
  `,
};

export const Zeco: Story = {
  render: () => `
    ${fontsLink}
    ${creatureStyles}
    <div class="creature">
      <h2 class="creature-name">Zeco</h2>
      <div class="creature-text">
        <p>Criatura curiosa que vive entre as estacoes. Pequeno, persistente, e cheio de perguntas sobre o mundo ao redor.</p>
      </div>
    </div>
    <div class="creature-banner" style="background: linear-gradient(135deg, #56ab2f, #a8e063, #f7dc6f);">
      <span class="creature-banner-label">[ imagem Zeco ]</span>
    </div>
  `,
};

export const Taylo: Story = {
  render: () => `
    ${fontsLink}
    ${creatureStyles}
    <div class="creature">
      <h2 class="creature-name">Taylo</h2>
      <div class="creature-text">
        <p>Bichitto doce que adora colecionar coisas pequenas. Tem uma familia crescente e um coracao enorme.</p>
      </div>
    </div>
    <div class="creature-banner" style="background: linear-gradient(135deg, #ff9a9e, #fecfef, #ffa751);">
      <span class="creature-banner-label">[ imagem Taylo ]</span>
    </div>
  `,
};
