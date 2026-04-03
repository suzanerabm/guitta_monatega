import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta = {
  title: 'Foundation/Design Tokens',
};
export default meta;

type Story = StoryObj;

const swatch = (name: string, value: string, textColor = '#fff') =>
  `<div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.5rem;">
    <div style="width:48px;height:48px;border-radius:6px;background:${value};border:1px solid #e0e0e0;flex-shrink:0;"></div>
    <div>
      <div style="font-family:'Fira Sans',sans-serif;font-size:0.85rem;font-weight:600;color:#1a1d21;">${name}</div>
      <div style="font-family:'Fira Sans',sans-serif;font-size:0.72rem;color:#999;letter-spacing:0.05em;">${value}</div>
    </div>
  </div>`;

const section = (title: string, content: string) =>
  `<div style="margin-bottom:2.5rem;">
    <h3 style="font-family:'Fira Sans',sans-serif;font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#999;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:1px solid #f0f0f0;">${title}</h3>
    ${content}
  </div>`;

export const Colors: Story = {
  render: () => {
    return `
      <div style="padding:2rem;max-width:720px;font-family:'Fira Sans',sans-serif;">
        <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:0.3rem;color:#1a1d21;">Colors</h2>
        <p style="font-size:0.85rem;color:#999;margin-bottom:2rem;">Paleta de cores do site Guitta Monatega</p>

        ${section('Core', `
          ${swatch('white', '#ffffff')}
          ${swatch('off-white', '#fafafa')}
          ${swatch('ink', '#1a1d21')}
          ${swatch('ink-soft', '#555555')}
          ${swatch('ink-muted', '#999999')}
          ${swatch('border', '#e0e0e0')}
          ${swatch('subtle', '#cccccc')}
        `)}

        ${section('Dark Theme', `
          ${swatch('dark-bg', '#0a0a1a')}
          ${swatch('dark-ink', '#e0e0e8')}
          ${swatch('dark-ink-soft', 'rgba(255,255,255,0.55)')}
          ${swatch('dark-ink-muted', 'rgba(255,255,255,0.3)')}
        `)}

        ${section('Bichittos', `
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            ${['#ff6b9d', '#ffa751', '#ffe259', '#6dd5fa'].map(c =>
              `<div style="width:64px;height:64px;border-radius:8px;background:${c};"></div>`
            ).join('')}
          </div>
          <div style="margin-top:0.8rem;display:flex;gap:0.5rem;">
            ${['pink', 'orange', 'yellow', 'blue'].map((n, i) =>
              `<span style="font-size:0.65rem;color:#999;width:64px;text-align:center;display:block;">${n}</span>`
            ).join('')}
          </div>
        `)}

        ${section('Kammara', `
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            ${['#0a0a2e', '#1a1a4e', '#2d1b69', '#0f3460'].map(c =>
              `<div style="width:64px;height:64px;border-radius:8px;background:${c};"></div>`
            ).join('')}
          </div>
          <div style="margin-top:0.8rem;display:flex;gap:0.5rem;">
            ${['deep', 'mid', 'purple', 'navy'].map(n =>
              `<span style="font-size:0.65rem;color:#999;width:64px;text-align:center;display:block;">${n}</span>`
            ).join('')}
          </div>
        `)}

        ${section('Gradient Preview', `
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <div style="width:200px;height:80px;border-radius:8px;background:linear-gradient(135deg,#ff6b9d,#ffa751,#ffe259,#6dd5fa);"></div>
            <div style="width:200px;height:80px;border-radius:8px;background:linear-gradient(135deg,#0a0a2e,#1a1a4e,#2d1b69,#0f3460);"></div>
            <div style="width:200px;height:80px;border-radius:8px;background:linear-gradient(135deg,#f5f5f5,#e8e8e8,#d4d4d4,#f0f0f0);"></div>
          </div>
          <div style="margin-top:0.5rem;display:flex;gap:1rem;">
            <span style="font-size:0.65rem;color:#999;width:200px;">bichittos</span>
            <span style="font-size:0.65rem;color:#999;width:200px;">kammara</span>
            <span style="font-size:0.65rem;color:#999;width:200px;">arte</span>
          </div>
        `)}
      </div>
    `;
  },
};

export const Typography: Story = {
  render: () => {
    const weights = [
      { name: 'Thin', value: 100, var: '--weight-thin' },
      { name: 'Light', value: 300, var: '--weight-light' },
      { name: 'Regular', value: 400, var: '--weight-regular' },
      { name: 'Medium', value: 500, var: '--weight-medium' },
      { name: 'Semibold', value: 600, var: '--weight-semibold' },
      { name: 'Bold', value: 700, var: '--weight-bold' },
    ];

    const sizes = [
      { name: 'xs', rem: '0.65rem', px: '10.4px', use: 'brand, labels' },
      { name: 'sm', rem: '0.72rem', px: '11.5px', use: 'filter buttons, technique' },
      { name: 'base', rem: '0.85rem', px: '13.6px', use: 'breadcrumb, subtitles' },
      { name: 'md', rem: '1rem', px: '16px', use: 'body, links' },
      { name: 'lg', rem: '1.05rem', px: '16.8px', use: 'paragraphs' },
      { name: 'xl', rem: '1.1rem', px: '17.6px', use: 'header name' },
      { name: '2xl', rem: '1.6rem', px: '25.6px', use: 'modal title' },
      { name: '3xl', rem: '1.8rem', px: '28.8px', use: 'section titles' },
    ];

    return `
      <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@100;300;400;500;600;700&display=swap" rel="stylesheet">
      <div style="padding:2rem;max-width:720px;font-family:'Fira Sans',sans-serif;">
        <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:0.3rem;color:#1a1d21;">Typography</h2>
        <p style="font-size:0.85rem;color:#999;margin-bottom:2rem;">Fira Sans — Google Fonts</p>

        ${section('Font Weights', weights.map(w =>
          `<div style="display:flex;align-items:baseline;gap:1.5rem;margin-bottom:1rem;">
            <span style="font-size:1.4rem;font-weight:${w.value};color:#1a1d21;">guitta monatega</span>
            <span style="font-size:0.65rem;color:#999;letter-spacing:0.05em;">${w.name} (${w.value})</span>
            <code style="font-size:0.6rem;color:#ccc;">${w.var}</code>
          </div>`
        ).join(''))}

        ${section('Font Sizes', `
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="text-align:left;border-bottom:1px solid #f0f0f0;">
                <th style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#999;padding:0.5rem 0;font-weight:400;">Token</th>
                <th style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#999;padding:0.5rem 0;font-weight:400;">Size</th>
                <th style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#999;padding:0.5rem 0;font-weight:400;">Preview</th>
                <th style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:#999;padding:0.5rem 0;font-weight:400;">Usage</th>
              </tr>
            </thead>
            <tbody>
              ${sizes.map(s =>
                `<tr style="border-bottom:1px solid #f8f8f8;">
                  <td style="padding:0.6rem 0;"><code style="font-size:0.7rem;color:#555;">--size-${s.name}</code></td>
                  <td style="padding:0.6rem 0;font-size:0.72rem;color:#999;">${s.rem} / ${s.px}</td>
                  <td style="padding:0.6rem 0;font-size:${s.rem};color:#1a1d21;font-weight:400;">Aa</td>
                  <td style="padding:0.6rem 0;font-size:0.72rem;color:#999;">${s.use}</td>
                </tr>`
              ).join('')}
            </tbody>
          </table>
        `)}

        ${section('Heading Scales (responsive)', `
          <div style="display:flex;flex-direction:column;gap:0.8rem;">
            <span style="font-size:clamp(3rem,8vw,6rem);font-weight:700;color:#1a1d21;letter-spacing:0.06em;text-transform:uppercase;line-height:1;">Hero Title</span>
            <span style="font-size:clamp(2rem,4vw,3rem);font-weight:700;color:#1a1d21;letter-spacing:0.04em;">Section Name</span>
            <span style="font-size:clamp(1.6rem,3vw,2.2rem);font-weight:700;color:#1a1d21;letter-spacing:0.03em;">Art Section Title</span>
          </div>
        `)}
      </div>
    `;
  },
};

export const Spacing: Story = {
  render: () => {
    const spaces = [
      { name: 'xs', value: '0.25rem', px: '4px' },
      { name: 'sm', value: '0.5rem', px: '8px' },
      { name: 'md', value: '0.8rem', px: '12.8px' },
      { name: 'lg', value: '1.5rem', px: '24px' },
      { name: 'xl', value: '3rem', px: '48px' },
      { name: '2xl', value: '5rem', px: '80px' },
    ];

    return `
      <div style="padding:2rem;max-width:720px;font-family:'Fira Sans',sans-serif;">
        <h2 style="font-size:1.8rem;font-weight:700;margin-bottom:0.3rem;color:#1a1d21;">Spacing</h2>
        <p style="font-size:0.85rem;color:#999;margin-bottom:2rem;">Escala de espacamento</p>

        ${spaces.map(s =>
          `<div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.8rem;">
            <code style="font-size:0.7rem;color:#555;width:100px;">--space-${s.name}</code>
            <div style="height:16px;width:${s.value};background:#1a1d21;border-radius:2px;"></div>
            <span style="font-size:0.72rem;color:#999;">${s.value} / ${s.px}</span>
          </div>`
        ).join('')}
      </div>
    `;
  },
};
