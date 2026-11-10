'use client';
import { useStudioProgramNavigation } from './hooks';
import type { StudioProgramNavigationProps } from './types';
import styles from './StudioProgramNavigation.module.css';

export function StudioProgramNavigation({ links, children }: StudioProgramNavigationProps) {
  const { rail, active } = useStudioProgramNavigation(links);
  return (
    <nav className={styles.navigation} aria-label="Розділи курсу">
      <div className="studio-wrap" ref={rail}>
        {links.map(([href, label]) => (
          <a key={href} href={href} aria-current={active === href ? 'location' : undefined}>
            {label}
          </a>
        ))}
        {children}
      </div>
    </nav>
  );
}
