import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ds-card {
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .ds-card-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .ds-card-scene {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .ds-char {
    position: absolute;
    transform: translateX(-50%);
  }

  .ds-char img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 4px 16px rgba(0,0,0,0.15));
  }

  .ds-text-wrap {
    position: absolute;
    left: 5rem;
    top: 240px;
    bottom: 4rem;
    width: 30%;
    max-width: 380px;
    z-index: 3;
  }

  .ds-text-card {
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
  }

  .ds-text-scroll::-webkit-scrollbar { display: none; }
  .ds-text-scroll h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.8rem; }
  .ds-text-scroll p { margin-bottom: 0.8rem; }

  .placeholder-char {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }
</style>`;

function charPlaceholder(emoji: string, x: number, bottom: number, size: number, bg: string, z: number = 1): string {
  return `<div class="ds-char" style="left:${x}%;bottom:${bottom}%;width:${size}px;height:${size}px;z-index:${z};">
    <div class="placeholder-char" style="width:100%;height:100%;background:${bg};border-radius:50%;">${emoji}</div>
  </div>`;
}

const meta: Meta = {
  title: 'Components/DSMainCard',
};
export default meta;
type Story = StoryObj;

export const NapCatScene: Story = {
  render: () => `
    ${font}${styles}
    <div class="ds-card" style="height:500px;">
      <div class="ds-card-bg" style="background:linear-gradient(135deg, #667eea, #764ba2, #f093fb);"></div>
      <div class="ds-card-scene">
        ${charPlaceholder('🐱', 55, 0, 200, 'rgba(255,255,255,0.15)', 2)}
        ${charPlaceholder('🐱', 82, 0, 160, 'rgba(255,255,255,0.1)', 1)}
      </div>
      <div class="ds-text-wrap" style="top:40px;">
        <div class="ds-text-card">
          <div class="ds-text-scroll">
            <h3 style="color:#b5a2dc;">NapCat</h3>
            <p style="color:#ddd4f4;">Cinza, macio, com a ponta do rabo azul — como se tivesse mergulhado num balde de tinta.</p>
            <h3 style="color:#b5a2dc;">Violeta</h3>
            <p style="color:#ddd4f4;">A irma gemea. Igual a ele, mas roxa. Mais quieta, mais observadora.</p>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const ZecoScene: Story = {
  render: () => `
    ${font}${styles}
    <div class="ds-card" style="height:500px;">
      <div class="ds-card-bg" style="background:linear-gradient(135deg, #ff8c42, #ff6b35, #ffa751);"></div>
      <div class="ds-card-scene">
        ${charPlaceholder('🟠', 50, 0, 220, 'rgba(255,255,255,0.15)', 2)}
        ${charPlaceholder('🐦', 25, 5, 140, 'rgba(255,255,255,0.1)', 1)}
        ${charPlaceholder('🦀', 78, 0, 160, 'rgba(255,255,255,0.1)', 1)}
      </div>
      <div class="ds-text-wrap" style="top:40px;">
        <div class="ds-text-card">
          <div class="ds-text-scroll">
            <h3 style="color:#f7b87f;">Zeco & Amigos</h3>
            <p style="color:#f9e3cf;">Redondo, laranja, com meias xadrez. Faz amizade com qualquer um.</p>
          </div>
        </div>
      </div>
    </div>
  `,
};

export const EmptyScene: Story = {
  render: () => `
    ${font}${styles}
    <div class="ds-card" style="height:400px;">
      <div class="ds-card-bg" style="background:linear-gradient(135deg, #5d9466, #427f49, #277230);"></div>
      <div class="ds-card-scene"></div>
    </div>
  `,
};
