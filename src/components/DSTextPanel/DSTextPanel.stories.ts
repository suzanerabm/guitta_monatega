import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ds-text-panel {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    overflow: hidden;
    background: transparent;
    outline: 2px solid rgba(255,255,255,0.2);
    outline-offset: 3px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  }

  .ds-text-scroll {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    padding: 2rem 1.5rem;
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.95rem;
    line-height: 1.7;
    font-weight: 300;
    mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%);
    scrollbar-width: none;
  }

  .ds-text-scroll::-webkit-scrollbar { display: none; }
  .ds-text-scroll h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.8rem; }
  .ds-text-scroll p { margin-bottom: 0.8rem; }

  .container {
    width: 350px;
    height: 400px;
    padding: 2rem;
  }
</style>`;

const meta: Meta = {
  title: 'Components/DSTextPanel',
};
export default meta;
type Story = StoryObj;

export const OnDarkBg: Story = {
  render: () => `
    ${font}${styles}
    <div class="container" style="background: linear-gradient(135deg, #667eea, #764ba2);">
      <div class="ds-text-panel" style="height:100%;">
        <div class="ds-text-scroll">
          <h3 style="color:#b5a2dc;">NapCat</h3>
          <p style="color:#ddd4f4;">Cinza, macio, com a ponta do rabo azul — como se tivesse mergulhado num balde de tinta.</p>
          <p style="color:#ddd4f4;">Calmo, charmoso, sempre de bom humor. O que ele mais gosta e tirar soneca.</p>
          <h3 style="color:#b5a2dc;">Violeta</h3>
          <p style="color:#ddd4f4;">A irma gemea. Igual a ele, mas roxa. Mais quieta, mais observadora.</p>
          <p style="color:#ddd4f4;">Juntos, sao inseparaveis. Ele dorme, ela vigia.</p>
        </div>
      </div>
    </div>
  `,
};

export const OnOrangeBg: Story = {
  render: () => `
    ${font}${styles}
    <div class="container" style="background: linear-gradient(135deg, #ff8c42, #ff6b35);">
      <div class="ds-text-panel" style="height:100%;">
        <div class="ds-text-scroll">
          <h3 style="color:#f7b87f;">Zeco</h3>
          <p style="color:#f9e3cf;">Redondo, laranja, com meias xadrez. Faz amizade com qualquer um.</p>
          <h3 style="color:#f7b87f;">Ninha</h3>
          <p style="color:#f9e3cf;">Uma passarinha que adora nadar. Melhor amiga do Zeco.</p>
        </div>
      </div>
    </div>
  `,
};

export const OnGreenBg: Story = {
  render: () => `
    ${font}${styles}
    <div class="container" style="background: linear-gradient(135deg, #5d9466, #427f49);">
      <div class="ds-text-panel" style="height:100%;">
        <div class="ds-text-scroll">
          <h3 style="color:#b6fcc0;">Taylo</h3>
          <p style="color:#d4f5da;">Um urso com orelhas maiores que os outros — e isso o torna especial.</p>
          <p style="color:#d4f5da;">Adora contar historias. Herdou dos ancestrais o poder das estrelas.</p>
        </div>
      </div>
    </div>
  `,
};
