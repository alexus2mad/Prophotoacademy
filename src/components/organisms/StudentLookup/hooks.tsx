'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import type { StudentLookupProps } from './types';

// Opens a student page by email, including people who have not signed up yet.
export function useStudentLookup({ demo }: StudentLookupProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  function open(event: FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    router.push((demo ? '/demo/admin/students/' : '/admin/students/') + encodeURIComponent(value));
  }
  return { email, setEmail, open };
}
