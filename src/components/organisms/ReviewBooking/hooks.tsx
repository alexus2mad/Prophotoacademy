'use client';
import { useEffect, useState } from 'react';
export function useReviewBooking() {
  const [roomKey, setRoomKey] = useState('');
  useEffect(() => {
    setRoomKey(new URLSearchParams(location.search).get('room') || '');
  }, []);
  return { roomKey };
}
