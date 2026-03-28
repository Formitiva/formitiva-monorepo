import { describe, it, expect } from 'vitest';
import { isDarkTheme, isDarkColor } from './themeUtils';

describe('isDarkTheme', () => {
  it('returns true for names containing "dark"', () => {
    expect(isDarkTheme('material-dark')).toBe(true);
    expect(isDarkTheme('midnight-dark')).toBe(true);
    expect(isDarkTheme('neon-cyber-dark')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isDarkTheme('DARK-mode')).toBe(true);
    expect(isDarkTheme('Material-DARK')).toBe(true);
  });

  it('returns false for light themes', () => {
    expect(isDarkTheme('material')).toBe(false);
    expect(isDarkTheme('fluent')).toBe(false);
    expect(isDarkTheme('tailwind')).toBe(false);
  });
});

describe('isDarkColor', () => {
  // ─── hex 6-digit ───────────────────────────────────────────────────────────
  it('returns true for black (#000000)', () => {
    expect(isDarkColor('#000000')).toBe(true);
  });

  it('returns false for white (#ffffff)', () => {
    expect(isDarkColor('#ffffff')).toBe(false);
  });

  it('returns true for a dark blue (#001a33)', () => {
    expect(isDarkColor('#001a33')).toBe(true);
  });

  it('returns false for a light yellow (#fffacd)', () => {
    expect(isDarkColor('#fffacd')).toBe(false);
  });

  // ─── hex 3-digit shorthand ──────────────────────────────────────────────────
  it('returns true for black shorthand (#000)', () => {
    expect(isDarkColor('#000')).toBe(true);
  });

  it('returns false for white shorthand (#fff)', () => {
    expect(isDarkColor('#fff')).toBe(false);
  });

  // ─── rgb / rgba ─────────────────────────────────────────────────────────────
  it('returns true for dark rgb()', () => {
    expect(isDarkColor('rgb(10, 10, 10)')).toBe(true);
  });

  it('returns false for light rgb()', () => {
    expect(isDarkColor('rgb(250, 250, 250)')).toBe(false);
  });

  it('returns false for white rgba()', () => {
    expect(isDarkColor('rgba(255, 255, 255, 0.5)')).toBe(false);
  });

  it('returns true for dark rgba()', () => {
    expect(isDarkColor('rgba(20, 20, 20, 1)')).toBe(true);
  });

  // ─── edge cases ──────────────────────────────────────────────────────────────
  it('returns false for an empty string', () => {
    expect(isDarkColor('')).toBe(false);
  });

  it('returns false for an unknown format (named color)', () => {
    expect(isDarkColor('chartreuse')).toBe(false);
  });
});
