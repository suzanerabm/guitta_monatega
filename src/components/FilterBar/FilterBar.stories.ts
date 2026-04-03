import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const filterStyles = `
  <style>
    .filter-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.8rem 1.5rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid #eee;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .filter-btn {
      font-family: 'Fira Sans', system-ui, sans-serif;
      font-size: 0.72rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.4rem 1rem;
      border: 1px solid #ddd;
      border-radius: 20px;
      background: transparent;
      color: #666;
      cursor: pointer;
      transition: all 0.25s ease;
    }
    .filter-btn:hover {
      border-color: #999;
      color: #333;
    }
    .filter-btn.active {
      background: #1a1d21;
      border-color: #1a1d21;
      color: #fff;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/FilterBar',
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => `
    ${fontsLink}
    ${filterStyles}
    <nav class="filter-bar">
      <button class="filter-btn active" data-filter="all">Todos</button>
      <button class="filter-btn" data-filter="black">Branco no Preto</button>
      <button class="filter-btn" data-filter="grafite">Grafite</button>
      <button class="filter-btn" data-filter="doodle">Doodle</button>
      <button class="filter-btn" data-filter="digital">Arte Digital</button>
    </nav>
  `,
};

export const English: Story = {
  render: () => `
    ${fontsLink}
    ${filterStyles}
    <nav class="filter-bar">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="black">White on Black</button>
      <button class="filter-btn" data-filter="grafite">Graphite</button>
      <button class="filter-btn" data-filter="doodle">Doodle</button>
      <button class="filter-btn" data-filter="digital">Digital Art</button>
    </nav>
  `,
};
