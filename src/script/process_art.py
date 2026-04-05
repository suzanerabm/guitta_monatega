#!/usr/bin/env python3
"""
Processa imagens de arte para o site da Guitta Monatega.

Para cada imagem na pasta de uma categoria:
  - Gera thumbnail (crop quadrado, 800x800, moldura branca) em _thumb/
  - Converte .heic para .jpg na pasta raiz (para o modal funcionar no browser)
  - Remove thumbs orfaos (cuja original foi apagada)

Uso: python3 process_art.py
Roda de dentro de src/script/ ou de qualquer lugar.
"""

import os
import sys
import subprocess
import tempfile
from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageStat

# Caminho relativo ao script → public/imgs/art/
BASE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "imgs", "art")

THUMB_SIZE = 800
BORDER = 16
QUALITY = 92
SUPPORTED_EXT = ('.png', '.jpg', '.jpeg', '.heic', '.webp')


def auto_white_balance(img):
    """Corrige balanco de branco baseado nos valores medios."""
    stat = ImageStat.Stat(img)
    avg = stat.mean[:3]
    target = sum(avg) / 3
    if target < 10:
        return img
    scale = [target / (c if c > 0 else 1) for c in avg]
    scale = [max(0.8, min(1.2, s)) for s in scale]

    r, g, b = img.split()[:3]
    r = r.point(lambda x: min(255, int(x * scale[0])))
    g = g.point(lambda x: min(255, int(x * scale[1])))
    b = b.point(lambda x: min(255, int(x * scale[2])))

    if img.mode == 'RGBA':
        return Image.merge('RGBA', (r, g, b, img.split()[3]))
    return Image.merge('RGB', (r, g, b))


def is_dark_image(img):
    """Detecta se a imagem e predominantemente escura."""
    stat = ImageStat.Stat(img.convert('L'))
    return stat.mean[0] < 80


def apply_background_blur(img, blur_radius=10, center_ratio=0.35):
    """Efeito bokeh: blur nas bordas, centro nitido."""
    import numpy as np

    w, h = img.size
    blurred = img.filter(ImageFilter.GaussianBlur(radius=blur_radius))

    cx, cy = w // 2, h // 2
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt(((X - cx) / (w * 0.5)) ** 2 + ((Y - cy) / (h * 0.5)) ** 2)

    mask = np.clip((dist - center_ratio) / (0.8 - center_ratio), 0, 1)
    mask = mask ** 1.3
    mask = mask * 0.9
    mask = (mask * 255).astype('uint8')
    mask_img = Image.fromarray(mask, mode='L')
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=35))

    return Image.composite(blurred, img, mask_img)


def convert_heic(input_path):
    """Converte HEIC para JPEG usando sips (macOS nativo)."""
    tmp = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
    tmp.close()
    subprocess.run(
        ['sips', '-s', 'format', 'jpeg', input_path, '--out', tmp.name],
        capture_output=True
    )
    return tmp.name


def open_image(input_path):
    """Abre imagem, convertendo HEIC se necessario."""
    if input_path.lower().endswith('.heic'):
        converted = convert_heic(input_path)
        img = Image.open(converted).convert('RGB')
        os.unlink(converted)
        return img
    return Image.open(input_path).convert('RGB')


def make_thumbnail(img, folder_name=""):
    """Gera thumbnail: crop quadrado, ajustes, moldura branca."""
    # 1. Crop quadrado centralizado
    w, h = img.size
    size = min(w, h)
    left = (w - size) // 2
    top = (h - size) // 2
    img = img.crop((left, top, left + size, top + size))

    # 2. Redimensionar
    inner = THUMB_SIZE - BORDER * 2
    img = img.resize((inner, inner), Image.LANCZOS)

    # 3. Detectar imagem escura
    dark = is_dark_image(img)

    # 4. Auto white balance (so pra imagens claras)
    if not dark:
        img = auto_white_balance(img)

    # 5. Ajustes
    img = ImageEnhance.Contrast(img).enhance(1.15 if not dark else 1.1)
    img = ImageEnhance.Brightness(img).enhance(1.05 if not dark else 1.0)
    img = ImageEnhance.Color(img).enhance(1.1 if not dark else 1.0)
    img = ImageEnhance.Sharpness(img).enhance(1.3)

    # 6. Suavizacao de ruido
    img = img.filter(ImageFilter.MedianFilter(size=3))

    # 8. Nitidez final
    img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=80, threshold=3))

    # 9. Moldura branca
    final = Image.new('RGB', (THUMB_SIZE, THUMB_SIZE), (255, 255, 255))
    x = (THUMB_SIZE - img.width) // 2
    y = (THUMB_SIZE - img.height) // 2
    final.paste(img, (x, y))

    return final


def convert_heic_to_jpg(input_path, folder_path):
    """Converte .heic para .jpg na mesma pasta e remove o .heic original."""
    base = os.path.splitext(os.path.basename(input_path))[0]
    jpg_path = os.path.join(folder_path, base + ".jpg")

    if os.path.exists(jpg_path):
        return jpg_path, False  # ja existe

    img = open_image(input_path)
    img.save(jpg_path, 'JPEG', quality=QUALITY, optimize=True)
    os.remove(input_path)
    return jpg_path, True


def main():
    base = os.path.abspath(BASE_PATH)
    if not os.path.exists(base):
        print(f"Pasta nao encontrada: {base}")
        sys.exit(1)

    print(f"Base: {base}\n")

    total_thumbs = 0
    total_converted = 0
    errors = 0

    for folder in sorted(os.listdir(base)):
        folder_path = os.path.join(base, folder)
        if not os.path.isdir(folder_path) or folder.startswith(('_', '.')):
            continue

        thumb_dir = os.path.join(folder_path, "_thumb")
        os.makedirs(thumb_dir, exist_ok=True)

        # Listar originais (excluindo _thumb e arquivos ocultos)
        images = sorted([
            f for f in os.listdir(folder_path)
            if f.lower().endswith(SUPPORTED_EXT)
            and not f.startswith('.')
        ])

        # Converter .heic → .jpg primeiro
        converted_count = 0
        updated_images = []
        for img_name in images:
            input_path = os.path.join(folder_path, img_name)
            if img_name.lower().endswith('.heic'):
                try:
                    jpg_path, was_new = convert_heic_to_jpg(input_path, folder_path)
                    if was_new:
                        converted_count += 1
                        total_converted += 1
                    updated_images.append(os.path.basename(jpg_path))
                except Exception as e:
                    errors += 1
                    print(f"  ✗ HEIC {img_name}: {e}")
            else:
                updated_images.append(img_name)

        # Limpar thumbs orfaos
        expected_thumbs = set(os.path.splitext(f)[0] + ".jpg" for f in updated_images)
        removed = 0
        for t in os.listdir(thumb_dir):
            if t.lower().endswith(('.jpg', '.jpeg', '.png')) and t not in expected_thumbs:
                os.remove(os.path.join(thumb_dir, t))
                removed += 1

        # Gerar thumbs que faltam
        new_thumbs = 0
        for img_name in updated_images:
            input_path = os.path.join(folder_path, img_name)
            out_name = os.path.splitext(img_name)[0] + ".jpg"
            thumb_path = os.path.join(thumb_dir, out_name)

            if os.path.exists(thumb_path):
                continue  # thumb ja existe, pular

            try:
                img = open_image(input_path)
                thumb = make_thumbnail(img, folder)
                thumb.save(thumb_path, 'JPEG', quality=QUALITY, optimize=True)
                new_thumbs += 1
                total_thumbs += 1
                print(f"  ✓ {img_name}")
            except Exception as e:
                errors += 1
                print(f"  ✗ {img_name}: {e}")

        status_parts = []
        if new_thumbs:
            status_parts.append(f"{new_thumbs} thumbs novos")
        if converted_count:
            status_parts.append(f"{converted_count} heic convertidos")
        if removed:
            status_parts.append(f"{removed} orfaos removidos")
        if not status_parts:
            status_parts.append("sem mudancas")

        print(f"  {folder.upper()} ({len(updated_images)} imgs) — {', '.join(status_parts)}")

    print(f"\n{'='*40}")
    print(f"  Thumbs gerados: {total_thumbs}")
    print(f"  HEIC convertidos: {total_converted}")
    print(f"  Erros: {errors}")
    print(f"{'='*40}\n")


if __name__ == '__main__':
    main()
