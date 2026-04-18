'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

interface Gallery {
  images: string[];
  /** Optional per-image labels (already-localized strings). */
  labels?: string[];
}

interface ModalState {
  isOpen: boolean;
  images: string[];
  /** Per-image labels parallel to `images`. Used as caption when set. */
  labels?: string[];
  currentIndex: number;
  title: string;
  technique: string;
  theme?: string;
  heroTitle?: string;
  heroText?: string;
  /** Visual variant: 'default' uses Modal, 'kammara' uses ModalKammara. */
  variant?: 'default' | 'kammara';
  /** Accent color for kammara variant. */
  color?: string;
  /** Dark base color for kammara variant. */
  darkColor?: string;
  /** Text color for kammara variant (palette.text). */
  textColor?: string;
  /** Crest glyph for kammara variant watermark. */
  crestGlyph?: string;
}

interface KammaraGalleryOpts {
  galleryId: string;
  startIndex: number;
  color: string;
  darkColor: string;
  textColor?: string;
  crestGlyph?: string;
  heroTitle?: string;
  heroText?: string;
}

interface ModalContextType {
  state: ModalState;
  openGallery: (
    galleryId: string,
    startIndex: number,
    title?: string,
    technique?: string,
    theme?: string,
    heroTitle?: string,
    heroText?: string
  ) => void;
  openModal: (
    title: string,
    technique: string,
    images: string[],
    startIndex: number,
    theme?: string,
    heroTitle?: string,
    heroText?: string
  ) => void;
  openKammaraGallery: (opts: KammaraGalleryOpts) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  registerGallery: (id: string, images: string[], labels?: string[]) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}

const initialState: ModalState = {
  isOpen: false,
  images: [],
  currentIndex: 0,
  title: '',
  technique: '',
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>(initialState);
  const galleriesRef = useRef<Record<string, Gallery>>({});

  const registerGallery = useCallback(
    (id: string, images: string[], labels?: string[]) => {
      galleriesRef.current[id] = { images, labels };
    },
    []
  );

  const openGallery = useCallback(
    (
      galleryId: string,
      startIndex: number,
      title = '',
      technique = '',
      theme?: string,
      heroTitle?: string,
      heroText?: string
    ) => {
      const gallery = galleriesRef.current[galleryId];
      if (!gallery) return;
      setState({
        isOpen: true,
        images: gallery.images,
        labels: gallery.labels,
        currentIndex: startIndex,
        title,
        technique,
        theme,
        heroTitle,
        heroText,
      });
    },
    []
  );

  const openModal = useCallback(
    (
      title: string,
      technique: string,
      images: string[],
      startIndex: number,
      theme?: string,
      heroTitle?: string,
      heroText?: string
    ) => {
      setState({
        isOpen: true,
        images,
        currentIndex: startIndex,
        title,
        technique,
        theme,
        heroTitle,
        heroText,
      });
    },
    []
  );

  const openKammaraGallery = useCallback(
    (opts: KammaraGalleryOpts) => {
      const gallery = galleriesRef.current[opts.galleryId];
      if (!gallery) return;
      setState({
        isOpen: true,
        images: gallery.images,
        labels: gallery.labels,
        currentIndex: opts.startIndex,
        title: '',
        technique: '',
        variant: 'kammara',
        color: opts.color,
        darkColor: opts.darkColor,
        textColor: opts.textColor,
        crestGlyph: opts.crestGlyph,
        heroTitle: opts.heroTitle,
        heroText: opts.heroText,
      });
    },
    []
  );

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  const next = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex + 1) % s.images.length,
    }));
  }, []);

  const prev = useCallback(() => {
    setState((s) => ({
      ...s,
      currentIndex: (s.currentIndex - 1 + s.images.length) % s.images.length,
    }));
  }, []);

  return (
    <ModalContext.Provider
      value={{ state, openGallery, openModal, openKammaraGallery, close, next, prev, registerGallery }}
    >
      {children}
    </ModalContext.Provider>
  );
}
