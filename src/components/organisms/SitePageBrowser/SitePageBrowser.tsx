'use client';
import { ArrowLeft, ExternalLink, Pencil, Search, Send } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { SitePagePreview } from '@/components/molecules/SitePagePreview/SitePagePreview';
import { environmentLabels, stateLabel, stateTone } from '@/lib/site-editor/environments';
import { pageGroupLabel } from '@/lib/site-editor/page-groups';
import { publicPageHref } from '@/lib/site-editor/sync/links';
import { useSitePageBrowser } from './hooks';
import type { SitePageBrowserProps } from './types';
import styles from './SitePageBrowser.module.css';

const changed = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

export function SitePageBrowser(props: SitePageBrowserProps) {
  const h = useSitePageBrowser(props);
  const { page } = h;
  const both = props.environments.length > 1;
  const state = page?.[props.target];
  const target = environmentLabels[props.target];

  return (
    <div className={styles.browser} data-view={h.view}>
      <div className={styles.listPane}>
        <label className={styles.search}>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            aria-label="Пошук сторінок"
            placeholder="Знайти за назвою або адресою"
            value={h.query}
            onChange={(event) => h.setQuery(event.target.value)}
          />
        </label>
        {both && (
          <p className={styles.legend}>
            <span data-tone="live">Опубліковано</span>
            <span data-tone="draft">Чернетка</span>
            <span data-tone="differs">Відрізняється від staging</span>
          </p>
        )}
        <nav aria-label="Сторінки за розділами" className={styles.groups}>
          {h.groups.map((group) => (
            <section key={group.id} aria-labelledby={'site-group-' + group.id}>
              <h2 id={'site-group-' + group.id}>
                {group.label} <span>{group.pages.length}</span>
              </h2>
              <ul>
                {group.pages.map((p) => (
                  <li key={p.path}>
                    <button
                      type="button"
                      className={styles.row}
                      aria-current={p.path === page?.path}
                      onClick={() => h.select(p.path)}
                    >
                      <span className={styles.rowText}>
                        <strong>{p.title}</strong>
                        <span className={styles.path}>{p.path}</span>
                      </span>
                      <span className={styles.dots}>
                        {props.environments.map((env) => (
                          <span
                            key={env}
                            role="img"
                            className={styles.dot}
                            data-tone={
                              env === 'production' && p.differs ? 'differs' : stateTone(p[env])
                            }
                            aria-label={environmentLabels[env] + ': ' + stateLabel(p[env])}
                            title={environmentLabels[env] + ': ' + stateLabel(p[env])}
                          >
                            {both ? environmentLabels[env][0] : ''}
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {h.total === 0 && (
            <p role="status" className={styles.empty}>
              За цим запитом сторінок немає
            </p>
          )}
        </nav>
      </div>

      {page && (
        <article className={styles.detailPane} aria-labelledby="site-page-detail">
          <button type="button" className={styles.back} onClick={h.back}>
            <ArrowLeft size={17} aria-hidden="true" /> До списку
          </button>
          <header className={styles.detailHead}>
            <p className={styles.kind}>
              {h.kindLabel(page.kind)} · {pageGroupLabel(page)}
            </p>
            <h2 id="site-page-detail" ref={h.detailHeading} tabIndex={-1}>
              {page.title}
            </h2>
            <p className={styles.path}>{page.path}</p>
          </header>
          {both && (
            <div className={styles.envSwitch} role="group" aria-label="Середовище">
              {props.environments.map((env) => (
                <button
                  key={env}
                  type="button"
                  aria-pressed={props.target === env}
                  onClick={() => props.onTarget(env)}
                >
                  <strong>{environmentLabels[env]}</strong>
                  <span data-tone={stateTone(page[env])}>{stateLabel(page[env])}</span>
                </button>
              ))}
            </div>
          )}
          <dl className={styles.facts}>
            {!both && (
              <div>
                <dt>Стан</dt>
                <dd>{stateLabel(state)}</dd>
              </div>
            )}
            {state?.updatedAt && (
              <div>
                <dt>Змінено{both ? ' на ' + target : ''}</dt>
                <dd>{changed.format(new Date(state.updatedAt))}</dd>
              </div>
            )}
            {page.differs && (
              <div>
                <dt>Staging і Prod</dt>
                <dd>
                  {page.differs === 'new'
                    ? 'Сторінка є лише на staging'
                    : 'Опублікована версія на staging відрізняється'}
                </dd>
              </div>
            )}
          </dl>
          <div className={styles.actions}>
            <Button
              disabled={props.disabled || !state}
              onClick={() => props.onOpen(page.path, props.target)}
            >
              <Pencil size={16} aria-hidden="true" /> Редагувати{both ? ' на ' + target : ''}
            </Button>
            {state?.published && (
              <a
                className="button button-secondary"
                href={publicPageHref(page.path, props.target)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={16} aria-hidden="true" /> Відкрити на сайті
              </a>
            )}
            {page.differs && props.onPublishToProduction && (
              <Button
                className="button button-secondary"
                disabled={props.disabled}
                onClick={() => props.onPublishToProduction?.(page.path)}
              >
                <Send size={16} aria-hidden="true" /> Опублікувати на Prod
              </Button>
            )}
          </div>
          {state ? (
            <SitePagePreview
              key={page.path + ':' + props.target}
              path={page.path}
              title={page.title}
              target={props.target}
              state={state}
            />
          ) : (
            <p className={styles.missing}>
              На {target} цієї сторінки немає.
              {page.differs === 'new' && ' Її можна опублікувати на Prod зі staging.'}
            </p>
          )}
        </article>
      )}
    </div>
  );
}
