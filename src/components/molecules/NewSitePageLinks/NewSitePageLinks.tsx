import Link from 'next/link';
import { readField } from '@/lib/site-editor/fields';
import type { NewSitePageLinksProps } from './types';
import styles from './NewSitePageLinks.module.css';

export function NewSitePageLinks({ pages, kind }: NewSitePageLinksProps) {
  const matches = pages.filter((page) => page.kind === kind);
  if (!matches.length) return null;
  return (
    <ul className={styles.list}>
      {matches.map((page) => (
        <li key={page.path}>
          <Link className={styles.link} href={page.path}>
            {readField(page, 'landing-cover', 'title') || page.title}
          </Link>
          {readField(page, 'landing-cover', 'description') && (
            <p>{readField(page, 'landing-cover', 'description')}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
