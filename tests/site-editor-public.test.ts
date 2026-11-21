import { afterEach, describe, expect, it, vi } from 'vitest';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { buildSiteSeeds } from '../src/lib/site-editor/seed-model';
import { programPresentationContent } from '../src/lib/site-editor/program';
import { legalContent } from '../src/lib/site-editor/support-pages';
import { newSitePage } from '../src/lib/site-editor/fields';
import { getPublishedPage, getEditorPage, listPublishedPages } from '../src/lib/site-editor/store';
import { currentMember } from '../src/lib/auth/server';
import { readSitePage, listNewSitePages } from '../src/lib/site-editor/public';
vi.mock('../src/lib/auth/server', () => ({ currentMember: vi.fn() }));
vi.mock('../src/lib/site-editor/store', () => ({
  getPublishedPage: vi.fn(),
  getEditorPage: vi.fn(),
  listPublishedPages: vi.fn(),
}));
const content = fixture as AcademyContent;
const docs = buildSiteSeeds(content);
const sample = newSitePage('/test-landing', 'Тестовий лендинг', 'landing');
afterEach(() => vi.resetAllMocks());

describe('public content editor integration', () => {
  it('gives every known page a unique path and unambiguous field and section IDs', () => {
    expect(docs).toHaveLength(18);
    expect(new Set(docs.map((p) => p.path)).size).toBe(docs.length);
    for (const page of docs) {
      expect(new Set(page.sections.map((s) => s.id)).size, page.path).toBe(page.sections.length);
      for (const section of page.sections)
        expect(new Set(section.fields.map((f) => f.id)).size, page.path + ' ' + section.id).toBe(
          section.fields.length,
        );
    }
  });
  it('keeps original legal structure and program offers while applying edited copy', () => {
    for (const original of content.pages) {
      expect(
        legalContent(
          original,
          docs.find((p) => p.path === '/' + original.slug),
        ).body,
      ).toEqual(original.body);
    }
    const original = content.programs.find((p) => p.slug === 'visual-content')!;
    const page = structuredClone(docs.find((p) => p.path === '/' + original.slug)!);
    page.sections.find((s) => s.id === 'overview')!.fields.find((f) => f.id === 'title')!.value =
      'Оновлений курс';
    const result = programPresentationContent(content, original, page);
    expect(result.program.title).toBe('Оновлений курс');
    expect(result.program).toMatchObject({
      id: original.id,
      slug: original.slug,
      modules: original.modules,
    });
    expect(result.content.offerings).toBe(content.offerings);
  });
  it('reads only published data for ordinary visitors', async () => {
    vi.mocked(getPublishedPage).mockResolvedValue(sample);
    expect(await readSitePage(sample.path)).toBe(sample);
    expect(currentMember).not.toHaveBeenCalled();
    expect(getEditorPage).not.toHaveBeenCalled();
  });
  it('checks identity before retrieving a draft and serves it only to an administrator', async () => {
    const preview = Promise.resolve({ 'site-editor-preview': '1' });
    vi.mocked(currentMember)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ role: 'student' } as never)
      .mockResolvedValueOnce({ role: 'admin' } as never);
    for (let i = 0; i < 2; i++) await expect(readSitePage(sample.path, preview)).rejects.toThrow();
    expect(getEditorPage).not.toHaveBeenCalled();
    vi.mocked(getEditorPage).mockResolvedValue({
      page: sample,
      published: false,
      hasDraft: true,
      revision: 'one',
    });
    expect(await readSitePage(sample.path, preview)).toBe(sample);
    expect(getPublishedPage).not.toHaveBeenCalled();
  });
  it('exposes only newly published template pages in discovery', async () => {
    vi.mocked(listPublishedPages).mockResolvedValue([docs[0], sample]);
    expect(await listNewSitePages()).toEqual([sample]);
  });
});
