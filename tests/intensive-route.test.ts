import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import fixture from '../content/academy.json';
import type { AcademyContent } from '../src/lib/content/types';
import { getContent } from '../src/lib/content';
import { enrollmentOptions } from '../src/lib/commerce/catalog';
import { ProgramTemplate } from '../src/components/templates/ProgramTemplate/ProgramTemplate';
import { StudioIntensiveTemplate } from '../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate';
import Intensive from '../src/app/(academy)/ai-artwork/page';
import sitemap from '../src/app/sitemap';

vi.mock('next/server', () => ({ connection: vi.fn(async () => undefined) }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('redirect');
  }),
}));
vi.mock('../src/lib/content', () => ({ getContent: vi.fn() }));
vi.mock('../src/lib/commerce/catalog', () => ({ enrollmentOptions: vi.fn() }));
vi.mock('../src/components/templates/ProgramTemplate/ProgramTemplate', () => ({
  ProgramTemplate: vi.fn(() => null),
}));
vi.mock('../src/components/templates/StudioIntensiveTemplate/StudioIntensiveTemplate', () => ({
  StudioIntensiveTemplate: vi.fn(() => null),
}));

const program = {
  ...fixture.programs[0],
  id: 'route-ai-artwork',
  slug: 'ai-artwork',
  category: 'class' as const,
};
const offering = {
  ...fixture.offerings[0],
  id: 'route-ai-artwork-offering',
  programId: program.id,
};
const content = {
  ...fixture,
  programs: [...fixture.programs.filter((item) => item.slug !== program.slug), program],
  offerings: [...fixture.offerings, offering],
} as AcademyContent;
const enrollment = { mode: 'mock' as const, packageIds: ['route-ticket'] };

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
  vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', '');
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://academy.example');
  vi.mocked(getContent).mockResolvedValue(content);
  vi.mocked(enrollmentOptions).mockResolvedValue(enrollment);
});
afterEach(() => vi.unstubAllEnvs());

describe('AI Artwork route ownership', () => {
  it.each(['studio', 'legacy'] as const)(
    'uses the same configured offering and enrollment in the %s design',
    async (design) => {
      vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', design);
      const page = await Intensive();
      expect(page.type).toBe(design === 'studio' ? StudioIntensiveTemplate : ProgramTemplate);
      expect(page.props).toMatchObject({ content, enrollment });
      if (design === 'legacy') expect(page.props.program).toBe(program);
      expect(enrollmentOptions).toHaveBeenCalledOnce();
      expect(enrollmentOptions).toHaveBeenCalledWith(offering);
      expect(connection).toHaveBeenCalledOnce();
      expect(redirect).not.toHaveBeenCalled();
    },
  );

  it('keeps the dedicated review page static', async () => {
    vi.stubEnv('NEXT_PUBLIC_REVIEW_MODE', 'pages');
    expect((await Intensive()).type).toBe(StudioIntensiveTemplate);
    expect(connection).not.toHaveBeenCalled();
  });

  it('retains the legacy catalog fallback when the content source has no intensive', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'legacy');
    vi.mocked(getContent).mockResolvedValue({
      ...content,
      programs: content.programs.filter((item) => item.slug !== 'ai-artwork'),
    });
    await expect(Intensive()).rejects.toThrow('redirect');
    expect(redirect).toHaveBeenCalledWith('/courses');
  });

  it.each(['studio', 'legacy'] as const)(
    'lists the configured intensive once in the %s sitemap',
    async (design) => {
      vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', design);
      const entries = await sitemap();
      expect(
        entries.filter((entry) => entry.url === 'https://academy.example/ai-artwork'),
      ).toHaveLength(1);
      expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length);
      expect(entries).toContainEqual({
        url: 'https://academy.example/courses',
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    },
  );
});
