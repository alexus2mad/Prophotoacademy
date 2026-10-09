'use client';
import { Button } from '@/components/atoms/Button/Button';
import { Dialog } from '@/components/molecules/Dialog/Dialog';
import { PackageComparisonTable } from '@/components/molecules/PackageComparisonTable/PackageComparisonTable';
import { usePackageComparison } from './hooks';
import type { PackageComparisonProps } from './types';

export function PackageComparison({
  packages,
  programId,
  offeringId,
  programTitle,
}: PackageComparisonProps) {
  const { dialog, first, setFirst, second, setSecond, inquire, selected } = usePackageComparison({
    packages,
    programId,
    offeringId,
    programTitle,
  });
  return (
    <>
      <Button
        className="text-link compare-trigger"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        aria-label="Порівняти пакети"
      >
        <span className="compare-label">
          <span className="compare-long">Порівняти пакети</span>
          <span className="compare-short">Порівняти</span>
        </span>
      </Button>
      <Dialog
        dialogRef={dialog}
        className="package-comparison-dialog"
        aria-labelledby="comparison-title"
        closeLabel="Закрити порівняння"
        closeOnBackdrop
        closeIconSize={22}
      >
        <h2 id="comparison-title">Порівняння пакетів</h2>
        <div className="comparison-desktop">
          <PackageComparisonTable
            items={packages}
            programTitle={programTitle}
            onClose={() => dialog.current?.close()}
            onInquire={inquire}
          />
        </div>
        <div className="comparison-mobile">
          {packages.length > 2 && (
            <div className="comparison-selectors">
              <div>
                <label htmlFor="comparison-first">Перший пакет</label>
                <select
                  id="comparison-first"
                  value={first}
                  onChange={(event) => setFirst(event.target.value)}
                >
                  {packages.map((pack) => (
                    <option key={pack.id} value={pack.id} disabled={pack.id === second}>
                      {pack.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="comparison-second">Другий пакет</label>
                <select
                  id="comparison-second"
                  value={second}
                  onChange={(event) => setSecond(event.target.value)}
                >
                  {packages.map((pack) => (
                    <option key={pack.id} value={pack.id} disabled={pack.id === first}>
                      {pack.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <PackageComparisonTable
            items={selected}
            programTitle={programTitle}
            onClose={() => dialog.current?.close()}
            onInquire={inquire}
          />
        </div>
      </Dialog>
    </>
  );
}
