'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import type { FormEvent } from 'react';
import type { CreatedCourse } from './types';
export function useAdminCourses(demo = false) {
  const router = useRouter(),
    [program, setProgram] = useState(''),
    action = useAdminMutation(demo);
  async function create(e: FormEvent) {
    e.preventDefault();
    const result = await action.mutate<CreatedCourse>('/api/admin/courses', { programId: program });
    if (result) router.push('/admin/courses/' + result.id);
  }
  return { ...action, program, setProgram, create };
}
