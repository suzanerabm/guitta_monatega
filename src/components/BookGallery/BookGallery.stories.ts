import type { Meta, StoryObj } from '@storybook/html';

const fontsLink = '<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">';

const galleryStyles = `
  <style>
    .book-gallery {
      max-width: 1000px;
      margin: 2rem auto 0;
      padding: 0 3rem;
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .book-gallery-title {
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 1.2rem;
    }
    .book-covers {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .book-cover {
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }
    .book-cover:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    .book-cover-placeholder {
      width: 100%;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.5);
      font-family: 'Fira Sans', system-ui, sans-serif;
    }
    .book-cover-label {
      padding: 0.6rem;
      text-align: center;
      font-size: 0.8rem;
      color: #555;
      font-weight: 400;
      background: #fff;
    }
  </style>
`;

const meta: Meta = {
  title: 'Components/BookGallery',
};
export default meta;
type Story = StoryObj;

export const FourSeasons: Story = {
  render: () => `
    ${fontsLink}
    ${galleryStyles}
    <div class="book-gallery">
      <p class="book-gallery-title">Livros - As 4 Estacoes</p>
      <div class="book-covers">
        <div class="book-cover">
          <div class="book-cover-placeholder" style="background: linear-gradient(135deg, #a8e063, #56ab2f);">[ capa ]</div>
          <div class="book-cover-label">Primavera</div>
        </div>
        <div class="book-cover">
          <div class="book-cover-placeholder" style="background: linear-gradient(135deg, #f7dc6f, #f39c12);">[ capa ]</div>
          <div class="book-cover-label">Verao</div>
        </div>
        <div class="book-cover">
          <div class="book-cover-placeholder" style="background: linear-gradient(135deg, #e67e22, #d35400);">[ capa ]</div>
          <div class="book-cover-label">Outono</div>
        </div>
        <div class="book-cover">
          <div class="book-cover-placeholder" style="background: linear-gradient(135deg, #74b9ff, #0984e3);">[ capa ]</div>
          <div class="book-cover-label">Inverno</div>
        </div>
      </div>
    </div>
  `,
};
