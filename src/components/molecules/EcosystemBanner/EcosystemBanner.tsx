import { EcosystemWordmark } from '@/components/atoms/EcosystemWordmark/EcosystemWordmark';
import { PreparedPhoto } from '@/components/atoms/PreparedPhoto/PreparedPhoto';
import type { EcosystemBannerProps } from './types';
export function EcosystemBanner({
  name,
  label,
  description,
  href,
  linkLabel,
  image,
}: EcosystemBannerProps) {
  return (
    <aside
      className={'academy-ecosystem-banner academy-ecosystem-banner--' + name.toLowerCase()}
      aria-label={label}
    >
      <div className="academy-ecosystem-banner-copy">
        <p className="academy-design-eyebrow">{label}</p>
        <h2>
          <EcosystemWordmark name={name} />
        </h2>
        <p>{description}</p>
      </div>
      <div className="academy-ecosystem-banner-photo">
        <PreparedPhoto image={image} sizes="(max-width: 599px) 100vw, 50vw" />
      </div>
      <a
        className="academy-outline-link"
        href={href}
        data-ecosystem-target={name === 'STUDIO' ? 'hub' : undefined}
      >
        {linkLabel}
      </a>
    </aside>
  );
}
