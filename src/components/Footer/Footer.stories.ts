import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  footer {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    font-family: 'Fira Sans', sans-serif;
  }
  .footer-line {
    width: 30px;
    height: 1px;
    background: #e0e0e0;
    margin: 0.3rem 0;
  }
  .footer-name {
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: lowercase;
    color: #999;
    font-weight: 300;
    text-decoration: none;
  }
  .footer-name:hover { color: #555; }
  .footer-brand {
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #ccc;
    font-weight: 400;
  }
</style>`;

const meta: Meta = {
  title: 'Components/Footer',
};
export default meta;
type Story = StoryObj;

export const Light: Story = {
  render: () => `
    ${font}${styles}
    <footer style="background:#fff;">
      <div class="footer-line"></div>
      <a href="/about" class="footer-name">guitta monatega</a>
      <span class="footer-brand">mosaicQ</span>
    </footer>
  `,
};

export const Dark: Story = {
  render: () => `
    ${font}${styles}
    <footer style="background:#0a0a1a;">
      <div class="footer-line" style="background:rgba(255,255,255,0.08);"></div>
      <a href="/about" class="footer-name" style="color:rgba(255,255,255,0.3);">guitta monatega</a>
      <span class="footer-brand" style="color:rgba(255,255,255,0.12);">mosaicQ</span>
    </footer>
  `,
};
