import type { Meta, StoryObj } from '@storybook/html';

const font = `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@300;400;700&display=swap" rel="stylesheet">`;

const styles = `
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
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
    gap: 1rem;
  }
  .book-covers-1 { grid-template-columns: 1fr; max-width: 280px; }
  .book-covers-2 { grid-template-columns: repeat(2, 1fr); max-width: 560px; }
  .book-covers-3 { grid-template-columns: repeat(3, 1fr); }
  .book-covers-4 { grid-template-columns: repeat(4, 1fr); }
  .book-covers-many { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
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
  .placeholder {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.5);
  }
  .book-cover-label {
    padding: 0.6rem;
    text-align: center;
    font-size: 0.8rem;
    color: #555;
    font-weight: 400;
    background: #fff;
  }
</style>`;

function bookCard(gradient: string, label: string): string {
  return `<div class="book-cover">
    <div class="placeholder" style="background:linear-gradient(135deg,${gradient});">[ capa ]</div>
    <div class="book-cover-label">${label}</div>
  </div>`;
}

const meta: Meta = {
  title: 'Components/BookGallery',
};
export default meta;
type Story = StoryObj;

export const SingleBook: Story = {
  render: () => `
    ${font}${styles}
    <div class="book-gallery">
      <p class="book-gallery-title">Livro</p>
      <div class="book-covers book-covers-1">
        ${bookCard('#667eea,#764ba2', 'NapCat Adventures')}
      </div>
    </div>
  `,
};

export const TwoBooks: Story = {
  render: () => `
    ${font}${styles}
    <div class="book-gallery">
      <p class="book-gallery-title">Livros</p>
      <div class="book-covers book-covers-2">
        ${bookCard('#fc5c7d,#6a82fb', 'Volume 1')}
        ${bookCard('#f093fb,#f5576c', 'Volume 2')}
      </div>
    </div>
  `,
};

export const FourBooks: Story = {
  render: () => `
    ${font}${styles}
    <div class="book-gallery">
      <p class="book-gallery-title">Livros - As 4 Estacoes</p>
      <div class="book-covers book-covers-4">
        ${bookCard('#a8e063,#56ab2f', 'Primavera')}
        ${bookCard('#f7dc6f,#f39c12', 'Verao')}
        ${bookCard('#e67e22,#d35400', 'Outono')}
        ${bookCard('#74b9ff,#0984e3', 'Inverno')}
      </div>
    </div>
  `,
};

export const ManyBooks: Story = {
  render: () => `
    ${font}${styles}
    <div class="book-gallery">
      <p class="book-gallery-title">Colecao Completa</p>
      <div class="book-covers book-covers-many">
        ${bookCard('#ff6b9d,#ffa751', 'Vol. 1')}
        ${bookCard('#6dd5fa,#2193b0', 'Vol. 2')}
        ${bookCard('#a8e063,#56ab2f', 'Vol. 3')}
        ${bookCard('#f093fb,#f5576c', 'Vol. 4')}
        ${bookCard('#667eea,#764ba2', 'Vol. 5')}
        ${bookCard('#f7dc6f,#f39c12', 'Vol. 6')}
      </div>
    </div>
  `,
};
