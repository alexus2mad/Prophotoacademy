import { describe, expect, it, vi } from 'vitest';

const query = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/database/client', () => ({ databasePool: () => ({ query }) }));
import { GET } from '../src/app/api/health/route';

describe('production health', () => {
  it('reports readiness only when the management migration exists', async () => {
    query.mockResolvedValueOnce({ rowCount: 1 });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ ok: true });
  });

  it('rejects a reachable database with missing migrations', async () => {
    query.mockResolvedValueOnce({ rowCount: 0 });
    expect((await GET()).status).toBe(503);
  });

  it('does not expose connection errors or credentials', async () => {
    query.mockRejectedValueOnce(new Error('private connection details'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ ok: false });
  });
});
