import Image from 'next/image';
import { studioAssetUrl } from '@/lib/studio-design/urls';
import type { InstallmentMethodsProps } from './types';
import styles from './InstallmentMethods.module.css';

const methods = [
  {
    name: 'monobank',
    src: '/brand/installments/monobank.png',
    width: 285,
    height: 290,
  },
  {
    name: 'ПриватБанк «Оплата частинами»',
    src: '/brand/installments/privatbank-parts.png',
    width: 225,
    height: 225,
  },
  {
    name: 'ПриватБанк «Миттєва розстрочка»',
    src: '/brand/installments/privatbank-instant.png',
    width: 471,
    height: 259,
    crop: true,
  },
  {
    name: 'А-Банк',
    src: '/brand/installments/a-bank.png',
    width: 455,
    height: 455,
  },
];

export function InstallmentMethods({ prominent = false }: InstallmentMethodsProps) {
  return (
    <figure
      className={prominent ? `${styles.badge} ${styles.prominent}` : styles.badge}
      data-installment-methods={prominent ? 'prominent' : 'compact'}
    >
      <ul className={styles.logos} role="list">
        {methods.map(({ name, src, width, height, crop }) => (
          <li key={name} className={crop ? styles.crop : undefined}>
            <Image src={studioAssetUrl(src)} alt={name} width={width} height={height} unoptimized />
          </li>
        ))}
      </ul>
      <figcaption className={styles.caption}>Оплата частинами</figcaption>
    </figure>
  );
}
