'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { ArtSection } from '@/components/ArtSection';
import { useModal } from '@/components/Modal';
import { artSectionMeta, artHero, type ArtSectionId } from '@/theme/artSections';
import { resolveInitialArt } from './resolveInitialArt';

interface ArtSectionData {
  id: string;
  thumbs: string[];
  full: string[];
}

interface Props {
  sections: ArtSectionData[];
}

export function ArtClient({ sections }: Props) {
  const t = useTranslations('art');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sectionIds = sections.map((s) => s.id);
  const [activeFilter, setActiveFilter] = useState(() =>
    resolveInitialArt(searchParams.get('art'), sectionIds),
  );

  // Troca a seção ativa E sincroniza a URL (?art=<id>), sem recarregar nem
  // empilhar histórico. É o único ponto de entrada do menu de filtros.
  const handleSelectFilter = (id: string) => {
    setActiveFilter(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set('art', id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { registerGallery, openGallery } = useModal();

  useEffect(() => {
    for (const s of sections) {
      if (s.full.length > 0) {
        registerGallery(s.id, s.full);
      }
    }
  }, [sections, registerGallery]);

  // Ao trocar de seção, a anterior desmonta e a nova monta — rola pra logo
  // abaixo do FilterBar sticky, esperando o layout assentar.
  useEffect(() => {
    const id = window.setTimeout(() => {
      const target = document.querySelector(
        `[data-section-art="${activeFilter}"]`,
      );
      if (!target) return;
      const bar = document.querySelector('nav[aria-label="filters"]');
      const offset = bar ? bar.getBoundingClientRect().bottom + 10 : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 80);
    return () => window.clearTimeout(id);
  }, [activeFilter]);

  const sectionsWithMeta = sections.map((s) => {
    const meta = artSectionMeta[s.id as ArtSectionId];
    let title = s.id;
    let technique = '';
    try {
      title = t(`sections.${s.id}.title` as never);
    } catch {
      // ignore
    }
    try {
      technique = t(`sections.${s.id}.technique` as never);
    } catch {
      // ignore
    }
    return { ...s, ...meta, title, technique };
  });

  const filters = sectionsWithMeta.map((s) => ({ id: s.id, label: s.title }));

  const handleThumbClick = (sectionId: string, idx: number) => {
    const s = sectionsWithMeta.find((x) => x.id === sectionId);
    if (!s || s.full.length === 0) return;
    openGallery(sectionId, idx, s.title, s.technique, s.theme);
  };

  return (
    <>
      <HeroSection
        label={t('heroLabel')}
        title={t('heroTitle')}
        labelBottom={t('heroLabelBottom')}
        background={artHero.background}
        textColor={artHero.textColor}
        labelColor={artHero.labelColor}
        minHeight="35vh"
      />

      <FilterBar
        filters={filters}
        showAll={false}
        defaultActive={sectionIds[0]}
        active={activeFilter}
        onFilter={handleSelectFilter}
      />

      {sectionsWithMeta.map((s) =>
        s.id !== activeFilter ? null : (
          <ArtSection
            key={s.id}
            id={s.id}
            title={s.title}
            technique={s.technique}
            bg={s.bg}
            titleColor={s.titleColor}
            techColor={s.techColor}
            large={s.large}
            thumbs={s.thumbs}
            onThumbClick={(idx) => handleThumbClick(s.id, idx)}
          />
        ),
      )}
    </>
  );
}
