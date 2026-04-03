import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">`;

const sparkle = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .soon-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #999;
    font-weight: 400;
    padding: 0.3rem 0.7rem;
    border: 1px solid #e0e0e0;
    border-radius: 20px;
    background: #fff;
  }
  .soon-badge-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0;
    padding: 0;
    background: rgba(0,0,0,0.35);
    color: #fff;
    font-size: 0.7rem;
  }
  .demo-overlay {
    position: relative;
    width: 300px;
    height: 200px;
    background: linear-gradient(135deg, #ddd, #eee);
    border-radius: 6px;
    overflow: hidden;
  }
</style>`;

const meta: Meta = {
  title: 'Components/SoonBadge',
};
export default meta;
type Story = StoryObj;

export const Inline: Story = {
  render: () => `
    ${font}${styles}
    <div style="padding:2rem;display:flex;gap:1rem;align-items:center;">
      <span class="soon-badge">${sparkle} <span>em breve</span></span>
      <span class="soon-badge">${sparkle} <span>coming soon</span></span>
    </div>
  `,
};

export const Overlay: Story = {
  render: () => `
    ${font}${styles}
    <div style="padding:2rem;display:flex;gap:1rem;">
      <div class="demo-overlay">
        <span class="soon-badge soon-badge-overlay">${sparkle} <span>em breve</span></span>
      </div>
      <div class="demo-overlay" style="background:linear-gradient(135deg,#667eea,#764ba2);">
        <span class="soon-badge soon-badge-overlay">${sparkle} <span>coming soon</span></span>
      </div>
    </div>
  `,
};
