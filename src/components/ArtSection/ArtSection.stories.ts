import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .art-section {
    padding: 4rem 0;
  }
  .art-section-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  .art-section-title {
    font-family: 'Fira Sans', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.2rem);
    font-weight: 700;
    letter-spacing: 0.03em;
    margin: 0 0 0.3rem;
  }
  .art-section-technique {
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 2rem;
  }
  .art-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 6px;
  }
  .art-grid-large {
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  .art-thumb {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 2px;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .art-thumb:hover {
    transform: scale(1.03);
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }
  .placeholder {
    background: linear-gradient(135deg, #ddd 0%, #eee 50%, #ddd 100%);
  }
</style>`;

function placeholders(count: number): string {
  return Array.from({ length: count }, (_, i) =>
    `<div class="art-thumb placeholder" data-section="demo" data-index="${i}"></div>`
  ).join('');
}

const meta: Meta = {
  title: 'Components/ArtSection',
};
export default meta;
type Story = StoryObj;

export const LightBackground: Story = {
  render: () => `
    ${font}${styles}
    <section class="art-section" style="background: #f0eeeb;">
      <div class="art-section-inner">
        <h2 class="art-section-title" style="color: #333;">Grafite</h2>
        <p class="art-section-technique" style="color: rgba(51,51,51,0.5);">Estudos com sombreamento e volume</p>
        <div class="art-grid art-grid-large">
          ${placeholders(10)}
        </div>
      </div>
    </section>
  `,
};

export const DarkBackground: Story = {
  render: () => `
    ${font}${styles}
    <section class="art-section" style="background: #1a1a1a;">
      <div class="art-section-inner">
        <h2 class="art-section-title" style="color: #fff;">Branco no Preto</h2>
        <p class="art-section-technique" style="color: rgba(255,255,255,0.5);">Nanquim branco sobre papel preto</p>
        <div class="art-grid">
          ${placeholders(8)}
        </div>
      </div>
    </section>
  `,
};

export const SmallGrid: Story = {
  render: () => `
    ${font}${styles}
    <section class="art-section" style="background: #e8eef2;">
      <div class="art-section-inner">
        <h2 class="art-section-title" style="color: #333;">Needle Felting</h2>
        <p class="art-section-technique" style="color: rgba(51,51,51,0.5);">Esculturas em miniatura com agulha e la</p>
        <div class="art-grid">
          ${placeholders(5)}
        </div>
      </div>
    </section>
  `,
};
