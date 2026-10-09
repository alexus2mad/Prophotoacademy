'use client';
import { useDialog } from '@/components/molecules/Dialog/hooks';
import type { ComparisonPackage } from '@/components/molecules/PackageComparisonTable/types';
import { openInquiry } from '@/lib/inquiries/events';
import { useState } from 'react';
import type { PackageComparisonProps } from './types';

export function usePackageComparison({
  packages,
  programId,
  offeringId,
  programTitle,
}: PackageComparisonProps) {
  const { dialog } = useDialog();
  const [first, setFirst] = useState(packages[0].id);
  const [second, setSecond] = useState(packages.at(-1)!.id);
  function inquire(pack: ComparisonPackage) {
    dialog.current?.close();
    openInquiry({
      programId,
      offeringId,
      packageId: pack.id,
      title: `${programTitle}: ${pack.name}`,
    });
  }
  const selected = [
    packages.find((pack) => pack.id === first)!,
    packages.find((pack) => pack.id === second)!,
  ];
  return { dialog, first, setFirst, second, setSecond, inquire, selected };
}
