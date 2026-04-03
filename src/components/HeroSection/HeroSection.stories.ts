import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const heroStyles = `
  <style>
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      padding: 8rem 2rem 4rem;
      position: relative;
      overflow: hidden;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .hero-label {
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      font-weight: 400;
      z-index: 1;
      animation: fadeIn 0.8s ease 0.1s forwards;
      opacity: 0;
    }
    .hero-title {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      z-index: 1;
      margin: 0;
      animation: fadeIn 1s ease 0.2s forwards;
      opacity: 0;
    }
    .hero-desc {
      font-size: 1rem;
      font-weight: 300;
      line-height: 1.5;
      text-align: center;
      max-width: 450px;
      z-index: 1;
      margin: 0;
      animation: fadeIn 1s ease 0.4s forwards;
      opacity: 0;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/HeroSection',
};
export default meta;
type Story = StoryObj;

export const Bichittos: Story = {
  render: () => `
    ${fontsLink}
    ${heroStyles}
    <section class="hero" style="background: linear-gradient(135deg, #ff6b9d 0%, #ffa751 30%, #ffe259 60%, #6dd5fa 100%); min-height: 55vh;">
      <span class="hero-label" style="color: rgba(255,255,255,0.6);">Serie</span>
      <h1 class="hero-title" style="color: #fff;">Bichittos</h1>
      <p class="hero-desc" style="color: #fff; opacity: 0.75;">Criaturas que existem entre o absurdo e o afeto.</p>
    </section>
  `,
};

export const Kammara: Story = {
  render: () => `
    ${fontsLink}
    ${heroStyles}
    <section class="hero" style="background: linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69); min-height: 55vh;">
      <span class="hero-label" style="color: rgba(255,255,255,0.3);">Saga Ilustrada</span>
      <h1 class="hero-title" style="color: #fff;">Kammara</h1>
      <p class="hero-desc" style="color: #fff; opacity: 0.75;">Mundos conectados. Sistemas vivos.</p>
    </section>
  `,
};

export const Art: Story = {
  render: () => `
    ${fontsLink}
    ${heroStyles}
    <section class="hero" style="background: linear-gradient(135deg, #f5f5f5, #e8e8e8, #f0f0f0); min-height: 35vh;">
      <span class="hero-label" style="color: #999;">Portfolio</span>
      <h1 class="hero-title" style="color: #1a1d21;">Arte</h1>
    </section>
  `,
};
