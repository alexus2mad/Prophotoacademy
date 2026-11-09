'use client';
import { useState } from 'react';
import { useStudioHomeCarousel } from '@/components/molecules/StudioHomeCarousel/hooks';

export function useStudioHomeReviews() {
  const [expanded, setExpanded] = useState(false);
  const carousel = useStudioHomeCarousel();
  return { ...carousel, expanded, toggleExpanded: () => setExpanded((value) => !value) };
}
