import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
const chevronLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`;
const chevronRight = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .modal-overlay {
    display: flex;
    position: relative;
    min-height: 500px;
    flex-direction: column;
    font-family: 'Fira Sans', sans-serif;
  }
  .modal-overlay.light { background: rgba(255,255,255,0.97); }
  .modal-overlay.dark { background: rgba(0,0,0,0.95); }
  .modal-close {
    position: absolute;
    top: 1.5rem;
    right: 2rem;
    font-size: 1.3rem;
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }
  .light .modal-close { color: #999; }
  .light .modal-close:hover { color: #1a1d21; }
  .dark .modal-close { color: rgba(255,255,255,0.5); }
  .dark .modal-close:hover { color: #fff; }
  .modal-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
    padding: 2rem 2rem 5rem;
    gap: 0.8rem;
  }
  .modal-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }
  .modal-title {
    font-size: 1.6rem;
    font-weight: 700;
    margin: 0;
  }
  .light .modal-title { color: #1a1d21; }
  .dark .modal-title { color: #fff; }
  .modal-technique {
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin: 0;
  }
  .light .modal-technique { color: #999; }
  .dark .modal-technique { color: rgba(255,255,255,0.4); }
  .modal-img-wrap {
    max-width: 75vw;
    max-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 1rem;
  }
  .light .modal-img-wrap {
    background: #f5f5f5;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }
  .dark .modal-img-wrap {
    background: rgba(255,255,255,0.05);
  }
  .modal-img-placeholder {
    width: 400px;
    height: 250px;
    border-radius: 2px;
    background: linear-gradient(135deg, #ddd, #eee, #ddd);
  }
  .dark .modal-img-placeholder {
    background: linear-gradient(135deg, #333, #444, #333);
  }
  .modal-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 1.2rem;
    backdrop-filter: blur(8px);
  }
  .light .modal-nav { background: rgba(255,255,255,0.9); }
  .dark .modal-nav { background: rgba(0,0,0,0.8); }
  .modal-counter {
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }
  .light .modal-counter { color: #ccc; }
  .dark .modal-counter { color: rgba(255,255,255,0.3); }
  .modal-btn {
    background: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.3rem 1rem;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }
  .light .modal-btn {
    border: 1px solid #e0e0e0;
    color: #999;
  }
  .light .modal-btn:hover {
    border-color: #1a1d21;
    color: #1a1d21;
  }
  .dark .modal-btn {
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.5);
  }
  .dark .modal-btn:hover {
    border-color: #fff;
    color: #fff;
  }
</style>`;

const meta: Meta = {
  title: 'Components/Modal',
};
export default meta;
type Story = StoryObj;

export const Light: Story = {
  render: () => `
    ${font}${styles}
    <div class="modal-overlay light">
      <button class="modal-close">${xIcon}</button>
      <div class="modal-body">
        <div class="modal-header">
          <h3 class="modal-title">Grafite</h3>
          <p class="modal-technique">Estudos com sombreamento e volume</p>
        </div>
        <div class="modal-img-wrap">
          <div class="modal-img-placeholder"></div>
        </div>
      </div>
      <div class="modal-nav">
        <button class="modal-btn">${chevronLeft}</button>
        <span class="modal-counter">3 / 10</span>
        <button class="modal-btn">${chevronRight}</button>
      </div>
    </div>
  `,
};

export const Dark: Story = {
  render: () => `
    ${font}${styles}
    <div class="modal-overlay dark">
      <button class="modal-close">${xIcon}</button>
      <div class="modal-body">
        <div class="modal-header">
          <h3 class="modal-title">Branco no Preto</h3>
          <p class="modal-technique">Nanquim branco sobre papel preto</p>
        </div>
        <div class="modal-img-wrap">
          <div class="modal-img-placeholder"></div>
        </div>
      </div>
      <div class="modal-nav">
        <button class="modal-btn">${chevronLeft}</button>
        <span class="modal-counter">7 / 18</span>
        <button class="modal-btn">${chevronRight}</button>
      </div>
    </div>
  `,
};
