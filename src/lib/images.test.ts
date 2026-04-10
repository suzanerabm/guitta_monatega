// src/lib/images.test.ts
import { describe, it, expect } from 'vitest';
import { getCharacters, getBooks, getArtImages, getScenes, getBookPages } from './images';

describe('Image Manifest Helpers', () => {
  it('getCharacters returns array for any key', () => {
    const chars = getCharacters('nonexistent');
    expect(Array.isArray(chars)).toBe(true);
    expect(chars).toEqual([]);
  });

  it('getBooks returns array for any key', () => {
    const books = getBooks('nonexistent');
    expect(Array.isArray(books)).toBe(true);
    expect(books).toEqual([]);
  });

  it('getArtImages returns object with thumbs and full arrays', () => {
    const images = getArtImages('nonexistent');
    expect(images).toHaveProperty('thumbs');
    expect(images).toHaveProperty('full');
    expect(Array.isArray(images.thumbs)).toBe(true);
    expect(Array.isArray(images.full)).toBe(true);
  });

  it('getScenes returns array for any key', () => {
    const scenes = getScenes('nonexistent');
    expect(Array.isArray(scenes)).toBe(true);
    expect(scenes).toEqual([]);
  });

  it('getBookPages returns empty array for nonexistent book', () => {
    const pages = getBookPages('nonexistent', 'also-nonexistent');
    expect(Array.isArray(pages)).toBe(true);
    expect(pages).toEqual([]);
  });

  // Smoke test: if the manifest has real data, ensure getters work
  it('getArtImages returns consistent structure for real sections', () => {
    // These are the section names from ArtContent.astro
    const sections = ['digital', 'doodle', 'grafite'];
    for (const section of sections) {
      const images = getArtImages(section);
      expect(images).toHaveProperty('thumbs');
      expect(images).toHaveProperty('full');
    }
  });
});
