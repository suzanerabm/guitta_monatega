import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const bannerStyles = `
  <style>
    .banner-section {
      position: relative;
      width: 100%;
      height: 100vh;
      min-height: 700px;
      overflow: hidden;
      cursor: pointer;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .banner-bg {
      position: absolute;
      top: -10%;
      left: 0;
      width: 100%;
      height: 120%;
      background-size: cover;
      background-position: center;
      transition: transform 0.6s ease;
    }
    .banner-section:hover .banner-bg { transform: scale(1.03); }
    .banner-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      z-index: 1;
    }
    .banner-label {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.6);
      font-weight: 400;
    }
    .banner-title {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-shadow: 0 2px 30px rgba(0,0,0,0.3);
      margin: 0;
    }
    .banner-desc {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.7);
      font-weight: 300;
      max-width: 400px;
      text-align: center;
      line-height: 1.5;
      margin: 0;
    }

    /* Bichittos */
    .banner-bichittos .banner-bg {
      background: linear-gradient(135deg, #ff6b9d, #ffa751, #ffe259, #6dd5fa, #ff6b9d);
      background-size: 400% 400%;
      animation: fluidBichittos 12s ease-in-out infinite;
    }
    .bichittos-shapes {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.08;
      animation: shapeFloat 8s ease-in-out infinite;
    }
    .shape:nth-child(1) { width: 180px; height: 180px; background: rgba(255,255,255,0.5); top: 10%; left: 5%; filter: blur(30px); }
    .shape:nth-child(2) { width: 120px; height: 120px; background: rgba(255,107,157,0.4); top: 55%; left: 70%; animation-delay: 2s; filter: blur(25px); }
    .shape:nth-child(3) { width: 100px; height: 100px; background: rgba(255,255,255,0.3); top: 25%; right: 10%; animation-delay: 4s; filter: blur(20px); }
    .shape:nth-child(4) { width: 150px; height: 150px; background: rgba(255,226,89,0.3); bottom: 15%; left: 20%; animation-delay: 2s; border-radius: 40%; }
    .shape:nth-child(5) { width: 90px; height: 90px; background: rgba(109,213,250,0.3); top: 65%; left: 45%; animation-delay: 3s; filter: blur(20px); }

    /* Kammara */
    .banner-kammara .banner-bg {
      background: linear-gradient(135deg, #0a0a2e, #1a1a4e, #2d1b69, #0f3460, #0a0a2e);
      background-size: 400% 400%;
      animation: fluidKammara 15s ease-in-out infinite;
    }
    .kammara-stars {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .star {
      position: absolute;
      background: #fff;
      border-radius: 50%;
      animation: starTwinkle 4s ease-in-out infinite;
    }
    .star:nth-child(1) { width: 2px; height: 2px; top: 12%; left: 8%; }
    .star:nth-child(2) { width: 3px; height: 3px; top: 25%; left: 45%; animation-delay: 0.7s; }
    .star:nth-child(3) { width: 1.5px; height: 1.5px; top: 18%; right: 20%; animation-delay: 1.4s; }
    .star:nth-child(4) { width: 2.5px; height: 2.5px; top: 40%; left: 25%; animation-delay: 2s; }
    .star:nth-child(5) { width: 2px; height: 2px; top: 55%; right: 35%; animation-delay: 2.8s; }
    .star:nth-child(6) { width: 3px; height: 3px; top: 35%; right: 10%; animation-delay: 1s; }
    .star:nth-child(7) { width: 1.5px; height: 1.5px; top: 65%; left: 60%; animation-delay: 3.5s; }
    .star:nth-child(8) { top: 75%; left: 15%; animation-delay: 1.2s; }
    .star:nth-child(9) { top: 50%; left: 80%; animation-delay: 0.3s; width: 2.5px; height: 2.5px; }
    .star:nth-child(10) { top: 80%; right: 25%; animation-delay: 1.8s; }
    .kammara-glow {
      position: absolute;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(100,80,200,0.2) 0%, rgba(60,60,180,0.05) 50%, transparent 70%);
      top: 25%;
      left: 50%;
      transform: translateX(-50%);
      animation: kammaraGlow 8s ease-in-out infinite;
      pointer-events: none;
      filter: blur(15px);
    }

    /* Arte */
    .banner-arte .banner-bg {
      background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 30%, #d4d4d4 60%, #f0f0f0 100%);
    }
    .arte-strokes {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .stroke {
      position: absolute;
      background: linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent);
      height: 1px;
      animation: strokeDraw 4s ease-in-out infinite;
    }
    .stroke:nth-child(1) { width: 40%; top: 25%; left: 5%; }
    .stroke:nth-child(2) { width: 30%; top: 45%; right: 10%; animation-delay: 1s; }
    .stroke:nth-child(3) { width: 50%; top: 65%; left: 15%; animation-delay: 2s; }
    .stroke:nth-child(4) { width: 25%; top: 35%; left: 40%; animation-delay: 0.5s; transform: rotate(45deg); }
    .stroke:nth-child(5) { width: 35%; top: 55%; right: 5%; animation-delay: 1.5s; transform: rotate(-15deg); }
    .banner-arte .banner-label { color: rgba(0,0,0,0.35); }
    .banner-arte .banner-title { color: #1a1d21; text-shadow: none; }
    .banner-arte .banner-desc { color: rgba(0,0,0,0.45); }

    /* Keyframes */
    @keyframes fluidBichittos {
      0% { background-position: 0% 50%; }
      25% { background-position: 100% 25%; }
      50% { background-position: 50% 100%; }
      75% { background-position: 0% 75%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes fluidKammara {
      0% { background-position: 0% 50%; }
      25% { background-position: 75% 0%; }
      50% { background-position: 100% 50%; }
      75% { background-position: 25% 100%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes shapeFloat {
      0%, 100% { transform: translateY(0) scale(1); }
      33% { transform: translateY(-15px) scale(1.05); }
      66% { transform: translateY(8px) scale(0.95); }
    }
    @keyframes starTwinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.5); }
    }
    @keyframes kammaraGlow {
      0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
      33% { transform: translateX(-45%) scale(1.3); opacity: 0.8; }
      66% { transform: translateX(-55%) scale(1.1); opacity: 1; }
    }
    @keyframes strokeDraw {
      0%, 100% { opacity: 0; transform: scaleX(0); }
      50% { opacity: 1; transform: scaleX(1); }
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/HomeBanner',
};
export default meta;
type Story = StoryObj;

export const Bichittos: Story = {
  render: () => `
    ${fontsLink}
    ${bannerStyles}
    <a href="/bichittos" style="text-decoration:none;display:block;">
      <section class="banner-section banner-bichittos">
        <div class="banner-bg"></div>
        <div class="bichittos-shapes">
          <div class="shape"></div><div class="shape"></div><div class="shape"></div>
          <div class="shape"></div><div class="shape"></div>
        </div>
        <div class="banner-overlay">
          <span class="banner-label">Serie</span>
          <h2 class="banner-title">Bichittos</h2>
          <p class="banner-desc">Criaturas que existem entre o absurdo e o afeto.</p>
        </div>
      </section>
    </a>
  `,
};

export const Kammara: Story = {
  render: () => `
    ${fontsLink}
    ${bannerStyles}
    <a href="/kammara" style="text-decoration:none;display:block;">
      <section class="banner-section banner-kammara">
        <div class="banner-bg"></div>
        <div class="kammara-stars">
          <div class="star"></div><div class="star"></div><div class="star"></div>
          <div class="star"></div><div class="star"></div><div class="star"></div>
          <div class="star"></div><div class="star"></div><div class="star"></div>
          <div class="star"></div>
        </div>
        <div class="kammara-glow"></div>
        <div class="banner-overlay">
          <span class="banner-label">Saga</span>
          <h2 class="banner-title">Kammara</h2>
          <p class="banner-desc">Mundos conectados. Sistemas vivos. Uma saga ilustrada.</p>
        </div>
      </section>
    </a>
  `,
};

export const Arte: Story = {
  render: () => `
    ${fontsLink}
    ${bannerStyles}
    <a href="/art" style="text-decoration:none;display:block;">
      <section class="banner-section banner-arte" style="width: 100vw;">
        <div class="banner-bg"></div>
        <div class="arte-strokes">
          <div class="stroke"></div><div class="stroke"></div><div class="stroke"></div>
          <div class="stroke"></div><div class="stroke"></div>
        </div>
        <div class="banner-overlay">
          <span class="banner-label">Portfolio</span>
          <h2 class="banner-title">Arte</h2>
          <p class="banner-desc">Ilustracao, concept art e design visual.</p>
        </div>
      </section>
    </a>
  `,
};
