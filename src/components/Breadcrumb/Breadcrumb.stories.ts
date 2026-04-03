import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const arrowLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`;
const house = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
const chevronRight = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .breadcrumb {
    padding: 0.6rem 3rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    text-transform: lowercase;
  }
  .breadcrumb-back {
    display: flex;
    align-items: center;
    color: #999;
    text-decoration: none;
    transition: color 0.2s;
  }
  .breadcrumb-back:hover { color: #1a1d21; }
  .breadcrumb-divider {
    width: 1px;
    height: 12px;
    background: #999;
    opacity: 0.25;
  }
  .breadcrumb-home {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .breadcrumb-link {
    color: #999;
    text-decoration: none;
    transition: color 0.2s;
  }
  .breadcrumb-link:hover { color: #1a1d21; }
  .breadcrumb-sep {
    color: #999;
    opacity: 0.35;
  }
  .breadcrumb-current {
    color: #555;
  }
</style>`;

const meta: Meta = {
  title: 'Components/Breadcrumb',
};
export default meta;
type Story = StoryObj;

export const SingleLevel: Story = {
  render: () => `
    ${font}${styles}
    <nav class="breadcrumb">
      <a href="/" class="breadcrumb-back" title="voltar">${arrowLeft}</a>
      <span class="breadcrumb-divider"></span>
      <a href="/" class="breadcrumb-link breadcrumb-home">${house}<span>home</span></a>
      ${chevronRight}
      <span class="breadcrumb-current">bichittos</span>
    </nav>
  `,
};

export const MultiLevel: Story = {
  render: () => `
    ${font}${styles}
    <nav class="breadcrumb">
      <a href="/" class="breadcrumb-back" title="voltar">${arrowLeft}</a>
      <span class="breadcrumb-divider"></span>
      <a href="/" class="breadcrumb-link breadcrumb-home">${house}<span>home</span></a>
      ${chevronRight}
      <a href="/bichittos" class="breadcrumb-link">bichittos</a>
      ${chevronRight}
      <span class="breadcrumb-current">napcat</span>
    </nav>
  `,
};

export const DarkTheme: Story = {
  render: () => `
    ${font}${styles}
    <div style="background:#0a0a1a;padding:1rem 0;">
      <nav class="breadcrumb">
        <a href="/" class="breadcrumb-back" title="voltar" style="color:rgba(255,255,255,0.3);">${arrowLeft}</a>
        <span class="breadcrumb-divider" style="background:rgba(255,255,255,0.3);"></span>
        <a href="/" class="breadcrumb-link breadcrumb-home" style="color:rgba(255,255,255,0.3);">${house}<span>home</span></a>
        <span style="color:rgba(255,255,255,0.15);">${chevronRight}</span>
        <span class="breadcrumb-current" style="color:rgba(255,255,255,0.55);">kammara</span>
      </nav>
    </div>
  `,
};
