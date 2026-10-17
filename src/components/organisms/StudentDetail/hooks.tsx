'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Grant } from '@/lib/learning/types';
import type { AccessAction } from '@/components/organisms/AccessDialog/types';
import type { AccessEditing } from './types';

export function useStudentDetail() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<AccessEditing | null>(null);
  // Each opening remounts the dialog with fresh form state, then shows it.
  useEffect(() => {
    if (editing) dialogRef.current?.showModal();
  }, [editing]);
  function openAccess(action: AccessAction, grant?: Grant) {
    setEditing({ key: Date.now(), grant, action });
  }
  function saved() {
    dialogRef.current?.close();
    setEditing(null);
    router.refresh();
  }
  return { dialogRef, editing, openAccess, saved };
}
