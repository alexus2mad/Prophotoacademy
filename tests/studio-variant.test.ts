import { afterEach, describe, expect, it, vi } from 'vitest';
import { academyDesign } from '../src/lib/studio-design/variant';

afterEach(() => vi.unstubAllEnvs());

describe('Academy presentation selection', () => {
  it('preserves the existing design when no variant is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', undefined);
    expect(academyDesign()).toBe('legacy');
  });

  it('activates only an explicitly configured known presentation', () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studio');
    expect(academyDesign()).toBe('studio');
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'legacy');
    expect(academyDesign()).toBe('legacy');
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DESIGN', 'studoi');
    expect(academyDesign).toThrow('Invalid NEXT_PUBLIC_ACADEMY_DESIGN');
  });
});
