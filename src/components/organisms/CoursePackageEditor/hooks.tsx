'use client';
import { useState } from 'react';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { FormEvent } from 'react';
import type { CoursePackageEditorProps } from './types';
export function useCoursePackageEditor({ courseId, data, demo }: CoursePackageEditorProps) {
  const h = useAdminMutation(demo),
    [offeringId, setOffering] = useState(data.offerings[0]?.id || ''),
    [packageId, setPackage] = useState(''),
    [releaseId, setRelease] = useState(data.releases[0]?.id || ''),
    [months, setMonths] = useState(''),
    [starts, setStarts] = useState(''),
    [lessons, setLessons] = useState<string[]>([]);
  const release = data.releases.find((r) => r.id === releaseId),
    offering = data.offerings.find((o) => o.id === offeringId);
  function selectPackage(id: string) {
    setPackage(id);
    const old = data.rules.find((r) => r.offeringId === offeringId && r.packageId === id);
    if (old) {
      setRelease(old.releaseId);
      setMonths(old.accessMonths === null ? '' : String(old.accessMonths));
      setStarts(old.startsAt?.slice(0, 16) || '');
      setLessons(old.lessonIds);
    } else {
      setLessons([]);
      setMonths('');
      setStarts('');
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    await h.mutate(`/api/admin/courses/${courseId}`, {
      action: 'package',
      value: {
        offeringId,
        packageId,
        releaseId,
        lessonIds: lessons,
        accessMonths: months ? Number(months) : null,
        startsAt: starts ? new Date(starts + 'Z').toISOString() : null,
      },
    });
  }
  return {
    ...h,
    offeringId,
    setOffering,
    packageId,
    selectPackage,
    releaseId,
    setRelease,
    months,
    setMonths,
    starts,
    setStarts,
    lessons,
    setLessons,
    release,
    offering,
    save,
  };
}
