import type { Meta, StoryObj } from '@storybook/html';

const styles = `
<style>
  .demo-box {
    width: 200px;
    height: 200px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Fira Sans', sans-serif;
    font-size: 0.8rem;
    color: #fff;
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .demo-box.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .stage {
    display: flex;
    gap: 2rem;
    padding: 3rem;
    background: #111;
    border-radius: 8px;
  }
</style>`;

const meta: Meta = {
  title: 'Components/ScrollReveal',
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => `
    ${styles}
    <div class="stage">
      <div class="demo-box visible" style="background: linear-gradient(135deg, #667eea, #764ba2);">
        Revealed
      </div>
      <div class="demo-box" style="background: linear-gradient(135deg, #ff8c42, #ff6b35);">
        Hidden
      </div>
    </div>
    <p style="color:#666; font-family:sans-serif; font-size:0.75rem; padding:1rem;">
      ScrollReveal uses IntersectionObserver to add a CSS class when elements enter the viewport. Left box has .visible applied, right box does not.
    </p>
  `,
};
