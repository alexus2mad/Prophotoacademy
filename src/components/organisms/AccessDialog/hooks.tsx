'use client';
import { useState } from 'react';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { FormEvent } from 'react';
import type { AccessAction, AccessDialogProps } from './types';

// Actions that choose a curriculum version and its lessons.
const mapping: AccessAction[] = ['grant', 'upgrade', 'migrate'];

export function useAccessDialog({
  email,
  courses,
  grant,
  initialAction,
  demo,
  onSaved,
}: AccessDialogProps) {
  const h = useAdminMutation(demo);
  const choices = courses.filter((c) => !grant || c.course_id === grant.course_id);
  const [action, setAction] = useState<AccessAction>(initialAction);
  const [releaseId, setReleaseId] = useState(grant?.release_id || choices[0]?.id || '');
  const [lessons, setLessons] = useState<string[]>(grant?.lesson_ids || []);
  const [packageName, setPackageName] = useState(grant?.package_name || 'Адміністративний доступ');
  const [expires, setExpires] = useState(grant?.expires_at?.slice(0, 10) || '');
  const [reason, setReason] = useState('');
  // A new grant keeps one id across retries, so a repeated submit cannot duplicate access.
  const [operationId] = useState(() => grant?.id || crypto.randomUUID());
  const release = choices.find((c) => c.id === releaseId);
  function chooseRelease(id: string) {
    setReleaseId(id);
    setLessons([]);
  }
  function toggleLesson(id: string, checked: boolean) {
    setLessons((current) => (checked ? [...current, id] : current.filter((x) => x !== id)));
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const saved = await h.mutate('/api/admin/access', {
      action,
      grantId: operationId,
      email,
      courseId: release?.course_id || grant?.course_id,
      releaseId,
      lessonIds: lessons,
      packageName,
      expiresAt: action === 'revoke' || !expires ? null : expires + 'T23:59:59Z',
      reason,
    });
    if (saved !== undefined) onSaved();
  }
  return {
    ...h,
    choices,
    action,
    setAction,
    releaseId,
    chooseRelease,
    release,
    lessons,
    toggleLesson,
    packageName,
    setPackageName,
    expires,
    setExpires,
    reason,
    setReason,
    showMapping: mapping.includes(action),
    save,
  };
}
