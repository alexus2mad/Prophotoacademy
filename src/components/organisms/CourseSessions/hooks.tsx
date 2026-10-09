'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMutation } from '@/lib/admin/hooks';
import { localSchedule, scheduleInstant } from '@/lib/learning/schedule';
import type { FormEvent } from 'react';
import type { LiveSession } from '@/lib/learning/types';
import type { CourseSessionsProps } from './types';
export function useCourseSessions({ courseId, demo }: CourseSessionsProps) {
  const h = useAdminMutation(demo),
    router = useRouter(),
    [id, setId] = useState(''),
    [lessonId, setLessonId] = useState(''),
    [offeringId, setOfferingId] = useState(''),
    [title, setTitle] = useState(''),
    [url, setUrl] = useState(''),
    [start, setStart] = useState(''),
    [end, setEnd] = useState(''),
    [status, setStatus] = useState<LiveSession['status']>('scheduled'),
    [recording, setRecording] = useState(''),
    [occurrence, setOccurrence] = useState<'earlier' | 'later'>('earlier');
  function edit(session: LiveSession) {
    setId(session.id);
    setLessonId(session.lesson_id);
    setOfferingId(session.offering_id || '');
    setTitle(session.title);
    setUrl(session.zoom_url);
    setStart(localSchedule(session.starts_at));
    setEnd(localSchedule(session.ends_at));
    setStatus(session.status);
    setRecording(session.recording_media_id || '');
  }
  function reset() {
    setId('');
    setLessonId('');
    setTitle('');
    setUrl('');
    setStart('');
    setEnd('');
    setStatus('scheduled');
    setRecording('');
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await h.mutate('/api/admin/sessions', {
        id: id || undefined,
        course_id: courseId,
        lesson_id: lessonId,
        offering_id: offeringId || null,
        title,
        zoom_url: url,
        starts_at: scheduleInstant(start, 'Europe/Kyiv', occurrence),
        ends_at: scheduleInstant(end, 'Europe/Kyiv', occurrence),
        timezone: 'Europe/Kyiv',
        status,
        recording_media_id: recording || null,
      });
      router.refresh();
    } catch (error) {
      h.setError(error instanceof Error ? error.message : 'Перевірте розклад');
    }
  }
  return {
    ...h,
    id,
    lessonId,
    setLessonId,
    offeringId,
    setOfferingId,
    title,
    setTitle,
    url,
    setUrl,
    start,
    setStart,
    end,
    setEnd,
    status,
    setStatus,
    recording,
    setRecording,
    occurrence,
    setOccurrence,
    edit,
    reset,
    save,
  };
}
