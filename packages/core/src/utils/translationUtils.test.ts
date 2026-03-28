import { describe, it, expect, beforeEach } from 'vitest';
import {
  createTranslationFunction,
  getSupportedLanguages,
  clearTranslationCaches,
  userTranslationCache,
  userFailedSet,
} from './translationUtils';

// ─── getSupportedLanguages ────────────────────────────────────────────────────

describe('getSupportedLanguages', () => {
  it('returns an object with English', () => {
    const langs = getSupportedLanguages();
    expect(langs).toHaveProperty('en');
    expect(langs.en.name).toBe('English');
  });

  it('includes 30 languages', () => {
    expect(Object.keys(getSupportedLanguages()).length).toBe(30);
  });

  it('has native name for French', () => {
    expect(getSupportedLanguages().fr.nativeName).toBe('Français');
  });
});

// ─── createTranslationFunction ────────────────────────────────────────────────

describe('createTranslationFunction', () => {
  it('returns the default text for English with no maps', () => {
    const t = createTranslationFunction('en', {}, {});
    expect(t('Hello')).toBe('Hello');
  });

  it('translates using commonMap when not English', () => {
    const t = createTranslationFunction('fr', { Hello: 'Bonjour' }, {});
    expect(t('Hello')).toBe('Bonjour');
  });

  it('prefers userMap over commonMap', () => {
    const t = createTranslationFunction('fr', { Hello: 'Bonjour' }, { Hello: 'Salut' });
    expect(t('Hello')).toBe('Salut');
  });

  it('falls back to the default text when key is missing from maps', () => {
    const t = createTranslationFunction('fr', {}, {});
    expect(t('Untranslated key')).toBe('Untranslated key');
  });

  it('interpolates {{1}} placeholder', () => {
    const t = createTranslationFunction('en', {}, {});
    expect(t('Hello, {{1}}!', 'World')).toBe('Hello, World!');
  });

  it('interpolates multiple numbered placeholders', () => {
    const t = createTranslationFunction('en', {}, {});
    expect(t('{{1}} and {{2}}', 'A', 'B')).toBe('A and B');
  });

  it('leaves unmatched placeholders intact when no arg at index', () => {
    const t = createTranslationFunction('en', {}, {});
    // Only 1 arg provided, {{2}} has no replacement
    const result = t('{{1}} then {{2}}', 'X');
    expect(result).toContain('X');
    expect(result).toContain('{{2}}');
  });

  it('applies interpolation to translated text', () => {
    const t = createTranslationFunction('fr', { 'Hello, {{1}}!': 'Bonjour, {{1}}!' }, {});
    expect(t('Hello, {{1}}!', 'Monde')).toBe('Bonjour, Monde!');
  });

  it('returns empty string for undefined/null input', () => {
    const t = createTranslationFunction('en', {}, {});
    expect(t(undefined as unknown as string)).toBe('');
    expect(t(null as unknown as string)).toBe('');
  });
});

// ─── clearTranslationCaches ───────────────────────────────────────────────────

describe('clearTranslationCaches', () => {
  beforeEach(() => clearTranslationCaches());

  it('clears the userTranslationCache', () => {
    userTranslationCache.set('en/test', { key: 'val' });
    clearTranslationCaches();
    expect(userTranslationCache.size).toBe(0);
  });

  it('clears the userFailedSet', () => {
    userFailedSet.add('en/bad-url');
    clearTranslationCaches();
    expect(userFailedSet.size).toBe(0);
  });
});
