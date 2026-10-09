'use client';
import { useState } from 'react';
import type { StudioBookingProps } from './types';

export function useStudioBooking({ providerUrl, roomKey }: StudioBookingProps) {
  const [loaded, setLoaded] = useState(false);
  const url = new URL(providerUrl);
  if (roomKey) url.searchParams.set('room', roomKey);
  return { loaded, setLoaded, url };
}
