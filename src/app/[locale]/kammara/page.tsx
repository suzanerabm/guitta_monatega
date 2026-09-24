import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getCharacters,
  getBookPages,
  getKammaraBg,
} from '@/lib/images';
import { getWorldSubsystemImages, getWorldScenes, getWorldDrops } from '@/data/characters/kammara/_worldData';
import { isKammaraPublished, getKammaraBooks } from '@/lib/visibility';
import { getCharactersForContext, type Locale } from '@/lib/characters';
import { KammaraClient } from './KammaraClient';

/**
 * Lista de imagens de personagens (vem do image-manifest) SEM os que estão
 * marcados `visible: false` no JSON de personagens. Sem esse cruzamento, o
 * nome + caminho de imagem de um personagem escondido ainda vazaria no payload
 * (o manifesto é uma fonte separada do JSON que carrega o flag `visible`).
 */
function getVisibleChars(contextId: string): { name: string; image: string }[] {
  const manifestChars = getCharacters(contextId);
  // O manifesto guarda VÁRIAS entradas por personagem (frente, costas,
  // variações), com nomes derivados do arquivo: "sereno", "sereno 2",
  // "sereno alta", "Sereno costas"... O `match` do JSON é só "Sereno". Por
  // isso o cruzamento não pode ser por igualdade — removemos toda entrada
  // cujo nome COMECE com o nome do personagem escondido.
  const hiddenPrefixes = getCharactersForContext(contextId)
    .filter((c) => c.visible === false)
    .map((c) => c.match.toLowerCase().trim());
  const isHidden = (name: string) => {
    const n = name.toLowerCase().trim();
    return hiddenPrefixes.some(
      (p) => n === p || n.startsWith(`${p} `) || n.startsWith(`${p}_`),
    );
  };
  return manifestChars.filter((c) => !isHidden(c.name));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'kammara' });
  return {
    title: t('pageTitle'),
    icons: { icon: '/icons/kammara.svg' },
  };
}

const WORLD_IDS = ['lunnp1', 'eni4', 'triplec', 'orfv', 'z1', 'gotto', 'digg', 'memphis'] as const;
const TRIPLEC_REGIONS = ['malloc', 'mesh', 'sharp'] as const;

export default async function KammaraPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  // SEGURANÇA: só monta o conteúdo dos mundos PUBLICADOS. Antes, o payload
  // enviado ao cliente continha lore/cenas/imagens de mundos incompletos
  // (ex: memphis 87%) — o gate só os escondia na UI, mas os dados vazavam no
  // RSC/HTML e eram baixáveis. Filtrar aqui, na origem (server), garante que
  // conteúdo não-publicado nunca sai da máquina. Em dev/preview
  // `isKammaraPublished` retorna true pra tudo (via showAll), então o fluxo de
  // edição continua vendo todos os mundos.
  const worlds = WORLD_IDS.filter((id) => isKammaraPublished(id)).map((id) => {
    const base = {
      id,
      chars: getVisibleChars(`kammara/${id}`),
      scenes: getWorldScenes(id, loc),
      drops: getWorldDrops(id, loc),
      bgImage: getKammaraBg(`kammara/${id}`),
      subsystemImages: getWorldSubsystemImages(id),
    };
    // Only triplec has sub-regions. Read their content in parallel so the
    // client has everything it needs without extra fetch logic.
    if (id === 'triplec') {
      const regions = Object.fromEntries(
        TRIPLEC_REGIONS.map((regionId) => [
          regionId,
          {
            id: regionId,
            chars: getVisibleChars(`kammara/triplec/${regionId}`),
            scenes: getWorldScenes(`triplec-${regionId}`, loc),
            drops: getWorldDrops(`triplec-${regionId}`, loc),
            bgImage: getKammaraBg(`kammara/triplec/${regionId}`),
            subsystemImages: getWorldSubsystemImages(`triplec-${regionId}`),
          },
        ])
      );
      return { ...base, regions };
    }
    return base;
  });

  const kammaraBooks = getKammaraBooks('kammara', loc).map((b) => ({
    ...b,
    pages: getBookPages('kammara', b.id),
  }));

  const kammaraBg = getKammaraBg('kammara');
  const kammaraChars = getVisibleChars('kammara');

  return (
    <KammaraClient
      worlds={worlds}
      kammaraBooks={kammaraBooks}
      kammaraBg={kammaraBg}
      kammaraChars={kammaraChars}
    />
  );
}
