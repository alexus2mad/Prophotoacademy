import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Member } from '../src/lib/auth/types';

const auth = vi.hoisted(() => ({
  member: null as Member | null,
  signOut: vi.fn(async (_options: unknown) => ({ error: null as Error | null })),
}));
vi.mock('../src/lib/auth/server', () => ({
  authConfigured: () => true,
  currentMember: async () => auth.member,
  authClient: async () => ({ auth: { signOut: auth.signOut } }),
  requireMember: vi.fn(),
}));
vi.mock('../src/lib/database/client', () => ({
  consumeRateLimit: vi.fn(),
  databasePool: vi.fn(),
  transaction: vi.fn(),
}));
vi.mock('../src/lib/http', async (original) => ({
  ...(await original<typeof import('../src/lib/http')>()),
  guardMutation: async () => {},
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error('REDIRECT:' + path);
  },
}));
import LoginPage from '../src/app/login/page';
import { POST } from '../src/app/api/auth/[action]/route';

afterEach(() => {
  auth.member = null;
  vi.clearAllMocks();
});
describe('device login and logout entry points', () => {
  it.each(['student', 'admin'] as const)(
    'resumes an existing %s session without another code',
    async (role) => {
      auth.member = {
        id: 'verified-user',
        email: 'verified@example.test',
        name: '',
        role,
        verified_at: '',
        created_at: '',
      };
      await expect(
        LoginPage({ searchParams: Promise.resolve({ next: '/learn/course/lesson' }) }),
      ).rejects.toThrow('REDIRECT:/learn/course/lesson');
      await expect(
        LoginPage({ searchParams: Promise.resolve({ next: 'https://other.example' }) }),
      ).rejects.toThrow('REDIRECT:/account');
      await expect(
        LoginPage({ searchParams: Promise.resolve({ next: '/admin', reauth: '1' }) }),
      ).resolves.toBeTruthy();
    },
  );
  it('keeps the email form for a signed-out visitor', async () => {
    await expect(LoginPage({ searchParams: Promise.resolve({}) })).resolves.toBeTruthy();
  });
  it('logs out only this device and reports failure instead of pretending success', async () => {
    const response = await POST(
      new Request('https://academy.example/api/auth/logout', { method: 'POST' }),
      { params: Promise.resolve({ action: 'logout' }) },
    );
    expect(response.status).toBe(200);
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    auth.signOut.mockResolvedValueOnce({ error: new Error('Temporary outage') });
    const failed = await POST(
      new Request('https://academy.example/api/auth/logout', { method: 'POST' }),
      { params: Promise.resolve({ action: 'logout' }) },
    );
    expect(failed.status).toBe(503);
  });
});
