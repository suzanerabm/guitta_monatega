#!/usr/bin/env python3
"""
Gera art.html a partir das imagens processadas em imgs/art/*/_thumb/

Uso: python3 generate_art.py
Roda de dentro da pasta guitta/.
Rode process_art.py antes para gerar os thumbnails.
"""

import os
import json

BASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "imgs", "art")
OUT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

# Metadados de cada seção — edite aqui pra ajustar
SECTIONS = {
    "black": {
        "title": "Black",
        "technique": "Nanquim branco sobre papel preto",
        "bg": "#1a1a1a",
        "text": "#fff",
    },
    "doodle": {
        "title": "Doodle",
        "technique": "Grafite e lápis sobre papel",
        "bg": "#f5f3ef",
        "text": "#333",
    },
    "fimo": {
        "title": "Pointillism",
        "technique": "Pontilhismo e mosaico com caneta",
        "bg": "#eef2e8",
        "text": "#333",
    },
    "needle": {
        "title": "Needle Felting",
        "technique": "Esculturas em miniatura com agulha e lã",
        "bg": "#e8eef2",
        "text": "#333",
    },
    "clay": {
        "title": "Clay",
        "technique": "Modelagem em argila e massa",
        "bg": "#f2ede8",
        "text": "#333",
    },
    "croche": {
        "title": "Crochê",
        "technique": "Amigurumi e peças em crochê",
        "bg": "#f0e8f2",
        "text": "#333",
    },
}

# Pastas novas que não estão no SECTIONS são detectadas automaticamente
# com estilo padrão. Basta criar a pasta em imgs/art/ e rodar os scripts.


def collect_images():
    """Coleta imagens _thumb de cada seção. Detecta pastas novas automaticamente."""
    data = {}

    # Ordem definida pelo SECTIONS, pastas novas vão pro final
    existing = set(
        f for f in os.listdir(BASE_PATH)
        if os.path.isdir(os.path.join(BASE_PATH, f)) and not f.startswith(('_', '.'))
    )
    ordered = [f for f in SECTIONS if f in existing]
    extras = sorted(existing - set(ordered))
    all_folders = ordered + extras

    for folder in all_folders:
        # Usar metadados do SECTIONS se existir, senão usar padrão
        if folder in SECTIONS:
            meta = SECTIONS[folder]
        else:
            meta = {
                "title": folder.capitalize(),
                "technique": "",
                "bg": "#f5f5f5",
                "text": "#333",
            }

        thumb_dir = os.path.join(BASE_PATH, folder, "_thumb")
        if not os.path.exists(thumb_dir):
            print(f"  Aviso: {thumb_dir} não existe. Rode process_art.py primeiro.")
            data[folder] = {**meta, "thumbs": [], "originals": []}
            continue

        thumbs = sorted([
            f for f in os.listdir(thumb_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png'))
            and not f.startswith('.')
        ])
        thumb_paths = [f"imgs/art/{folder}/_thumb/{img}" for img in thumbs]

        # Mapear thumb -> original
        originals_dir = os.path.join(BASE_PATH, folder)
        originals = {
            os.path.splitext(f)[0]: f
            for f in os.listdir(originals_dir)
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.heic'))
            and not f.startswith('.')
        }
        # Checar se existe _full/ (HEIC convertidos)
        full_dir = os.path.join(BASE_PATH, folder, "_full")

        original_paths = []
        for t in thumbs:
            stem = os.path.splitext(t)[0]
            full_jpg = os.path.join(full_dir, stem + ".jpg")

            if os.path.exists(full_jpg):
                # HEIC convertido pra JPG full
                original_paths.append(f"imgs/art/{folder}/_full/{stem}.jpg")
            elif stem in originals:
                orig_file = originals[stem]
                if orig_file.lower().endswith('.heic'):
                    original_paths.append(f"imgs/art/{folder}/_thumb/{t}")
                else:
                    original_paths.append(f"imgs/art/{folder}/{orig_file}")
            else:
                original_paths.append(f"imgs/art/{folder}/_thumb/{t}")

        data[folder] = {**meta, "thumbs": thumb_paths, "originals": original_paths}
    return data


def build_html(gallery_data):
    """Gera o HTML completo."""

    # Filtro buttons
    filter_buttons = '        <button class="filter-btn active" onclick="filterArt(\'all\')">Todos</button>\n'
    for folder, data in gallery_data.items():
        filter_buttons += f'        <button class="filter-btn" onclick="filterArt(\'{folder}\')">{data["title"]}</button>\n'

    # Sections HTML
    sections_html = ""
    for folder, data in gallery_data.items():
        if not data["thumbs"]:
            continue

        thumbs = ""
        for j, img in enumerate(data["thumbs"]):
            thumbs += f'        <div class="art-thumb" onclick="openArt(\'{folder}\', {j})">\n'
            thumbs += f'          <img src="{img}" alt="" loading="lazy">\n'
            thumbs += f'        </div>\n'

        sections_html += f'''
  <section class="art-section" data-section="{folder}" style="background: {data["bg"]};" data-art>
    <div class="art-section-header">
      <h2 class="art-section-title" style="color: {data["text"]};">{data["title"]}</h2>
      <p class="art-section-technique" style="color: {data["text"]}; opacity: 0.5;">{data["technique"]}</p>
    </div>
    <div class="art-grid">
{thumbs}    </div>
  </section>
'''

    gallery_json = json.dumps({k: v["originals"] for k, v in gallery_data.items()})
    meta_json = json.dumps({k: {"title": v["title"], "technique": v["technique"]} for k, v in gallery_data.items()})

    return f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Arte — Guitta Montega</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,300;0,400;0,500;0,600;0,700&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}

  :root {{
    --white: #ffffff;
    --ink: #1a1d21;
    --ink-soft: #555;
    --ink-muted: #999;
    --sans: 'Fira Sans', system-ui, sans-serif;
  }}

  html {{ scroll-behavior: smooth; }}

  body {{
    background: var(--white);
    color: var(--ink);
    font-family: var(--sans);
    font-weight: 300;
    overflow-x: hidden;
  }}

  header {{
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 100;
    padding: 1.5rem 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(14px);
  }}

  .header-name {{
    font-weight: 300;
    font-size: 1.1rem;
    letter-spacing: 0.25em;
    text-transform: lowercase;
    color: var(--ink);
    text-decoration: none;
  }}

  .header-name strong {{ font-weight: 600; }}

  .header-back {{
    font-size: 0.75rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-muted);
    text-decoration: none;
    transition: color 0.3s;
  }}

  .header-back:hover {{ color: var(--ink); }}

  .hero {{
    min-height: 35vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    padding: 7rem 2rem 2rem;
    background: linear-gradient(135deg, #f5f5f5, #e8e8e8, #f0f0f0);
  }}

  .hero-label {{
    font-size: 0.7rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.3);
    opacity: 0;
    animation: fadeIn 0.8s ease 0.1s forwards;
  }}

  .hero-title {{
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 700;
    color: var(--ink);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    opacity: 0;
    animation: fadeIn 1s ease 0.2s forwards;
  }}

  /* — FILTER BAR */
  .filter-bar {{
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.5rem 2rem;
    background: var(--white);
    position: sticky;
    top: 62px;
    z-index: 50;
    border-bottom: 1px solid #f0f0f0;
  }}

  .filter-btn {{
    background: none;
    border: 1px solid #e0e0e0;
    padding: 0.45rem 1.2rem;
    border-radius: 2rem;
    font-family: var(--sans);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--ink-muted);
    cursor: pointer;
    transition: all 0.25s;
    text-transform: uppercase;
    font-weight: 400;
  }}

  .filter-btn:hover {{
    border-color: var(--ink);
    color: var(--ink);
  }}

  .filter-btn.active {{
    background: var(--ink);
    border-color: var(--ink);
    color: var(--white);
  }}

  /* — ART SECTION */
  .art-section {{
    padding: 3rem 0 2rem;
    transition: opacity 0.4s ease, max-height 0.5s ease;
    overflow: hidden;
  }}

  .art-section.hidden {{
    opacity: 0;
    max-height: 0;
    padding: 0;
    pointer-events: none;
  }}

  .art-section.visible {{
    opacity: 1;
  }}

  .art-section-header {{
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 3rem 1.5rem;
  }}

  .art-section-title {{
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 0.2rem;
  }}

  .art-section-technique {{
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 400;
  }}

  .art-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 6px;
    padding: 0 6px;
  }}

  .art-thumb {{
    aspect-ratio: 1;
    overflow: hidden;
    cursor: pointer;
    border-radius: 2px;
  }}

  .art-thumb img {{
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }}

  .art-thumb:hover img {{
    transform: scale(1.04);
  }}

  /* — MODAL */
  .art-modal {{
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(255,255,255,0.96);
    z-index: 200;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }}

  .art-modal.open {{ display: flex; }}

  .art-modal-close {{
    position: absolute;
    top: 1.5rem;
    right: 2rem;
    font-size: 1.3rem;
    color: var(--ink-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }}

  .art-modal-close:hover {{ color: var(--ink); }}

  .art-modal-content {{
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: center;
    padding: 2rem 2rem 5rem;
    max-width: 100%;
    gap: 0.8rem;
  }}

  .art-modal-info {{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }}

  .art-modal-title {{
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--ink);
  }}

  .art-modal-technique {{
    font-size: 0.72rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--ink-muted);
  }}

  .art-modal-img-wrap {{
    max-width: 75vw;
    max-height: 65vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 4px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    padding: 1rem;
  }}

  .art-modal-img {{
    max-width: 100%;
    max-height: 63vh;
    object-fit: contain;
    border-radius: 2px;
  }}

  /* Navegação fixa no fundo */
  .art-modal-bottom {{
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    padding: 1.2rem;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(8px);
  }}

  .art-modal-counter {{
    font-size: 0.72rem;
    color: #ccc;
    letter-spacing: 0.1em;
  }}

  .art-modal-btn {{
    background: none;
    border: 1px solid #e0e0e0;
    color: var(--ink-muted);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.4rem 1rem;
    border-radius: 4px;
    font-family: var(--sans);
    transition: all 0.2s;
  }}

  .art-modal-btn:hover {{
    border-color: var(--ink);
    color: var(--ink);
  }}

  footer {{
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }}

  .footer-line {{
    width: 30px;
    height: 1px;
    background: #e0e0e0;
    margin: 0.3rem 0;
  }}

  .footer-name {{
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    text-transform: lowercase;
    color: var(--ink-muted);
    font-weight: 300;
  }}

  .footer-brand {{
    font-size: 0.65rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #ccc;
  }}

  @keyframes fadeIn {{
    from {{ opacity: 0; }}
    to {{ opacity: 1; }}
  }}

  @media (max-width: 768px) {{
    header {{ padding: 1.2rem 1.5rem; }}
    .art-grid {{ grid-template-columns: repeat(2, 1fr); }}
    .art-modal-content {{ padding: 4rem 1rem 5rem; }}
    .art-modal-img-wrap {{ max-width: 92vw; max-height: 55vh; }}
    .art-section-header {{ padding: 0 1.5rem 1rem; }}
    .filter-bar {{ flex-wrap: wrap; }}
  }}
</style>
</head>
<body>

<div id="site-header"></div>

<section class="hero">
  <span class="hero-label">Portfolio</span>
  <h1 class="hero-title">Arte</h1>
</section>

<div class="filter-bar">
{filter_buttons}</div>

{sections_html}

<div id="site-modal"></div>
<div id="site-footer"></div>

<script src="components/layout.js"></script>
<script src="components/modal.js"></script>
<script>
  // Scroll reveal
  const obs = new IntersectionObserver((entries) => {{
    entries.forEach((e) => {{
      if (e.isIntersecting) {{ e.target.classList.add('visible'); obs.unobserve(e.target); }}
    }});
  }}, {{ threshold: 0.1 }});
  document.querySelectorAll('[data-art]').forEach(el => obs.observe(el));

  // Filter
  function filterArt(section) {{
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.art-section').forEach(s => {{
      if (section === 'all' || s.dataset.section === section) {{
        s.classList.remove('hidden');
      }} else {{
        s.classList.add('hidden');
      }}
    }});
  }}

  // Register galleries
  const galleries = {gallery_json};
  const sectionMeta = {meta_json};
  Object.keys(galleries).forEach(k => registerGallery(k, galleries[k]));

  function openArt(section, idx) {{
    const meta = sectionMeta[section];
    openGallery(section, idx, meta.title, meta.technique);
  }}
</script>

</body>
</html>'''


def main():
    data = collect_images()
    html = build_html(data)

    out_file = os.path.join(OUT_PATH, "art.html")
    with open(out_file, "w") as f:
        f.write(html)

    total = sum(len(v["thumbs"]) for v in data.values())
    print(f"art.html gerado — {total} imagens em {len([v for v in data.values() if v['thumbs']])} seções")


if __name__ == '__main__':
    main()
