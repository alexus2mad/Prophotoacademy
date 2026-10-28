import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useInvitationNotice } from '../src/components/molecules/InvitationNotice/hooks';

const navigation = vi.hoisted(() => ({ refresh: vi.fn() }));
const lifecycle = vi.hoisted(() => ({ effect: vi.fn() }));
vi.mock('react', () => ({ useEffect: lifecycle.effect }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
vi.mock('../src/lib/admin/hooks', () => ({
  useAdminMutation: () => ({ mutate: vi.fn(), setMessage: vi.fn() }),
}));

const enableTimers = vi.useFakeTimers.bind(vi);
const restoreTimers = vi.useRealTimers.bind(vi);
beforeEach(() => {
  enableTimers();
  vi.clearAllMocks();
});
afterEach(() => restoreTimers());

describe('bounded invitation status refresh', () => {
  it('checks a pending invitation three times, then stops while retaining explicit refresh', () => {
    const hook = useInvitationNotice({
      email: 'student@example.test',
      audience: 'student',
      invitation: { state: 'pending', requestedAt: '2026-10-28T12:00:00Z' },
    });
    lifecycle.effect.mock.calls[0][0]();
    vi.advanceTimersByTime(1_999);
    expect(navigation.refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(navigation.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(3_000);
    expect(navigation.refresh).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(60_000);
    expect(navigation.refresh).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
    hook.refresh();
    expect(navigation.refresh).toHaveBeenCalledTimes(4);
  });

  it('cancels remaining checks when the component unmounts or invitation changes', () => {
    useInvitationNotice({
      email: 'teacher@example.test',
      audience: 'admin',
      invitation: { state: 'retrying', requestedAt: '2026-10-28T12:00:00Z' },
    });
    const cleanup = lifecycle.effect.mock.calls[0][0]();
    if (typeof cleanup === 'function') cleanup();
    vi.runAllTimers();
    expect(navigation.refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    { demo: true, state: 'pending' as const },
    { demo: false, state: 'sent' as const },
    { demo: false, state: 'none' as const },
  ])('does not poll a demo or settled invitation: $demo / $state', ({ demo, state }) => {
    useInvitationNotice({
      email: 'student@example.test',
      audience: 'student',
      demo,
      invitation: { state, requestedAt: null },
    });
    expect(lifecycle.effect.mock.calls[0][0]()).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });
});
