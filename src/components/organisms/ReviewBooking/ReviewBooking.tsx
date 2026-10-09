'use client';
import { StudioBooking } from '@/components/organisms/StudioBooking/StudioBooking';
import { useReviewBooking } from './hooks';
import type { ReviewBookingProps } from './types';
export function ReviewBooking({ rooms, providerUrl, phone }: ReviewBookingProps) {
  const { roomKey } = useReviewBooking();
  const room = rooms.find((item) => item.bookingKey === roomKey);
  return (
    <StudioBooking
      providerUrl={providerUrl}
      roomKey={room?.bookingKey}
      roomTitle={room?.title}
      phone={phone}
    />
  );
}
