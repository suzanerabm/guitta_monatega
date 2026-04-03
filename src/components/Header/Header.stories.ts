import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  header {
    position: relative;
    top: 0; left: 0; right: 0;
    padding: 1.5rem 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(14px);
    font-family: 'Fira Sans', sans-serif;
  }
  header.transparent {
    background: rgba(255,255,255,0);
    backdrop-filter: blur(0);
  }
  header.dark {
    background: rgba(10,10,26,0.9);
  }
  .header-name {
    font-weight: 300;
    font-size: 1.1rem;
    letter-spacing: 0.25em;
    text-transform: lowercase;
    color: #1a1d21;
    text-decoration: none;
  }
  .header-name strong { font-weight: 600; }
  header.dark .header-name { color: #e0e0e8; }
  .header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
  }
  .lang-toggle {
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #999;
    text-decoration: none;
    border: 1px solid currentColor;
    border-radius: 3px;
    padding: 0.25rem 0.6rem;
    transition: all 0.2s;
  }
  .lang-toggle:hover { color: #1a1d21; border-color: #1a1d21; }
  header.dark .lang-toggle { color: rgba(255,255,255,0.3); }
  header.dark .lang-toggle:hover { color: #fff; border-color: #fff; }
</style>`;

const meta: Meta = {
  title: 'Components/Header',
};
export default meta;
type Story = StoryObj;

export const Light: Story = {
  render: () => `
    ${font}${styles}
    <header>
      <a href="/" class="header-name"><strong>guitta</strong> monatega</a>
      <div class="header-right">
        <a href="/en" class="lang-toggle">PT</a>
      </div>
    </header>
  `,
};

export const Dark: Story = {
  render: () => `
    ${font}${styles}
    <div style="background:#0a0a1a;padding-bottom:2rem;">
      <header class="dark">
        <a href="/" class="header-name"><strong>guitta</strong> monatega</a>
        <div class="header-right">
          <a href="/en" class="lang-toggle">PT</a>
        </div>
      </header>
    </div>
  `,
};

export const Transparent: Story = {
  render: () => `
    ${font}${styles}
    <div style="background:linear-gradient(135deg,#ff6b9d,#ffa751,#ffe259,#6dd5fa);min-height:200px;position:relative;">
      <header class="transparent" style="position:absolute;width:100%;">
        <a href="/" class="header-name" style="opacity:0.5;"><strong>guitta</strong> monatega</a>
        <div class="header-right">
          <a href="/en" class="lang-toggle">PT</a>
        </div>
      </header>
    </div>
  `,
};
