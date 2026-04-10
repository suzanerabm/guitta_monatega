'use client';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { ArtSection } from '@/components/ArtSection';
import { useModal } from '@/components/Modal';
import { artSectionMeta, artHero, type ArtSectionId } from '@/theme/artSections';

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
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState('all');
  const { registerGallery, openGallery } = useModal();

  useEffect(() => {
    for (const s of sections) {
      if (s.full.length > 0) {
        registerGallery(s.id, s.full);
      }
    }
  }, [sections, registerGallery]);

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
        allLabel={locale === 'en' ? 'All' : 'Todos'}
        onFilter={setActiveFilter}
      />

      {sectionsWithMeta.map((s) => (
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
          hidden={activeFilter !== 'all' && activeFilter !== s.id}
          onThumbClick={(idx) => handleThumbClick(s.id, idx)}
        />
      ))}
    </>
  );
}
