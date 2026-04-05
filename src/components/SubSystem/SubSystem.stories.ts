import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .subsystem-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    padding: 2rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .subsystem-card {
    border-radius: 16px;
    outline: 2px solid rgba(255,255,255,0.2);
    outline-offset: 3px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .subsystem-title {
    display: block;
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    padding: 1.2rem 1.5rem 0.8rem;
    font-weight: 600;
    font-family: 'Fira Sans', sans-serif;
  }

  .subsystem-body {
    display: flex;
    flex: 1;
    gap: 0;
  }

  .subsystem-image {
    flex: 0 0 45%;
    overflow: hidden;
  }

  .subsystem-image-placeholder {
    width: 100%;
    height: 100%;
    min-height: 200px;
    background: rgba(255,255,255,0.05);
  }

  .subsystem-text {
    flex: 1;
    padding: 1rem 1.5rem 1.5rem;
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.85rem;
    line-height: 1.6;
    font-weight: 300;
  }

  .subsystem-text p {
    margin-bottom: 0.6rem;
  }

  .stage {
    padding: 2rem;
    min-height: 400px;
    border-radius: 8px;
  }
</style>`;

const card = (title: string, titleColor: string, textColor: string, text: string, hasImage = false) => `
  <div class="subsystem-card">
    <span class="subsystem-title" style="color: ${titleColor};">${title}</span>
    <div class="subsystem-body">
      <div class="subsystem-image">
        ${hasImage ? '<div class="subsystem-image-placeholder" style="background: rgba(255,255,255,0.1);"></div>' : '<div class="subsystem-image-placeholder"></div>'}
      </div>
      <div class="subsystem-text" style="color: ${textColor};">
        <p>${text}</p>
      </div>
    </div>
  </div>
`;

const meta: Meta = {
  title: 'Components/SubSystem',
};
export default meta;
type Story = StoryObj;

export const LunnP1: Story = {
  render: () => `
    ${font}${styles}
    <div class="stage" style="background: linear-gradient(160deg, #001a0e 0%, #003d1a 40%, #002e14 100%);">
      <div class="subsystem-grid">
        ${card('Cultura', '#00e676', '#69f0ae', 'Os habitantes se comunicam por frequencias de luz.')}
        ${card('Ecossistema', '#00e676', '#69f0ae', 'Oceanos profundos e cristais luminescentes.')}
        ${card('Tecnologia', '#00e676', '#69f0ae', 'Dispositivos que capturam e traduzem frequencias de luz.')}
      </div>
    </div>
  `,
};

export const ENI4: Story = {
  render: () => `
    ${font}${styles}
    <div class="stage" style="background: linear-gradient(160deg, #1a0e22 0%, #2a1a3a 40%, #200f2e 100%);">
      <div class="subsystem-grid">
        ${card('Cultura', '#6b4a7a', '#c4a8d4', 'Criaturas vivem entre camadas de nuvens.')}
        ${card('Ecossistema', '#6b4a7a', '#c4a8d4', 'Florestas suspensas e raizes flutuantes.')}
        ${card('Tecnologia', '#6b4a7a', '#c4a8d4', 'Asas translucidas e sensores de vento.')}
      </div>
    </div>
  `,
};

export const WithImage: Story = {
  render: () => `
    ${font}${styles}
    <div class="stage" style="background: linear-gradient(160deg, #1a1408 0%, #3a2a1a 40%, #2a1e10 100%);">
      <div class="subsystem-grid">
        ${card('Cultura', '#8a7a4a', '#d4c8a0', 'Guardioes de memorias ancestrais.', true)}
        ${card('Ecossistema', '#8a7a4a', '#d4c8a0', 'Desertos dourados e ruinas antigas.', true)}
        ${card('Tecnologia', '#8a7a4a', '#d4c8a0', 'Leitura de graos de areia.', true)}
      </div>
    </div>
  `,
};
