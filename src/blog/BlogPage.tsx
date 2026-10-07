import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SettingsProvider } from '../site/SettingsContext';
import Footer from '../home/Footer';
import WhatsAppFab from '../home/WhatsAppFab';
import '../home/tokens.css';
import BlogHeader from './BlogHeader';
import { AUTHOR, AUTHOR_NOTE, CATEGORIES, UI, formatDate, hasTranslation, pick, type BlogPost, type Lang } from './data';
import { useBlogStore } from './store';
import { normalize, useBlogData } from './useBlogData';
import styles from './BlogPage.module.css';

const categoryName = (slug: string, lang: Lang) => {
  const c = CATEGORIES.find((x) => x.slug === slug);
  return c ? pick(c.name, lang) : slug;
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Card({ post, lang }: { post: BlogPost; lang: Lang }) {
  const t = UI[lang];
  return (
    <Link className={styles.card} to={`/blog/${post.slug}`}>
      <div className={styles.photo}>
        <img src={post.image} alt={post.alt} width={900} height={560} loading="lazy" style={{ objectPosition: post.position }} />
      </div>
      <div className={styles.cardMeta}>
        <span>
          {t.reading}: {post.minutes} {t.minutes}
        </span>
        <span className={styles.cat}>{categoryName(post.category, lang)}</span>
      </div>
      <h3>{pick(post.title, lang)}</h3>
      <p>{pick(post.excerpt, lang)}</p>
      <span className={styles.go}>{t.readMore}</span>
    </Link>
  );
}

export default function BlogPage() {
  const { ready } = useBlogData();
  const lang = useBlogStore((s) => s.lang);
  const category = useBlogStore((s) => s.category);
  const query = useBlogStore((s) => s.query);
  const posts = useBlogStore((s) => s.posts);
  const source = useBlogStore((s) => s.source);
  const t = UI[lang];

  useEffect(() => {
    const previous = document.title;
    document.title = 'Blog — Hellominus';
    return () => {
      document.title = previous;
    };
  }, []);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return posts.filter((p) => {
      if (category !== 'todo' && p.category !== category) return false;
      if (!q) return true;
      return normalize(`${pick(p.title, lang)} ${pick(p.excerpt, lang)}`).includes(q);
    });
  }, [posts, category, query, lang]);

  const featured = visible.find((p) => p.featured) ?? visible[0];
  const recent = visible.filter((p) => p !== featured).slice(0, 3);
  const missing = lang === 'en' && visible.some((p) => !hasTranslation(p.title));
  const label = category === 'todo' ? t.all : categoryName(category, lang);

  return (
    <SettingsProvider>
      <div className="home-root" id="top">
        <BlogHeader />
        <main>
          {featured && (
            <section className={`${styles.top} tone-light`} aria-label={t.featured}>
              <Link className={styles.feat} to={`/blog/${featured.slug}`}>
                <div className={styles.featPhoto}>
                  <img src={featured.image} alt={featured.alt} width={1400} height={790} style={{ objectPosition: featured.position }} />
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.cat}>{categoryName(featured.category, lang)}</span>
                  <span>
                    {featured.minutes} min
                  </span>
                </div>
                <h1>{pick(featured.title, lang)}</h1>
                <p>{pick(featured.excerpt, lang)}</p>
              </Link>
              <aside className={styles.recent} aria-label={t.recent}>
                <h2>{t.recent}</h2>
                {recent.map((p) => (
                  <Link key={p.slug} className={styles.item} to={`/blog/${p.slug}`}>
                    <div>
                      <div className={styles.date}>
                        {t.published} {formatDate(p.publishedAt, lang)}
                      </div>
                      <h3>{pick(p.title, lang)}</h3>
                      <div className={styles.by}>
                        <span className={styles.avatar} aria-hidden="true">
                          {initials(AUTHOR.es)}
                        </span>
                        {t.by} {pick(AUTHOR, lang)}
                      </div>
                    </div>
                    <div className={styles.thumb}>
                      <img src={p.image} alt="" width={200} height={200} loading="lazy" />
                    </div>
                  </Link>
                ))}
                <p className={styles.note}>{pick(AUTHOR_NOTE, lang)}.</p>
              </aside>
            </section>
          )}

          <div className={styles.rule}>
            <b>{t.blog}</b>
            <span>
              {label} · {visible.length} {visible.length === 1 ? t.article : t.articles}
            </span>
          </div>
          {missing && (
            <p className={styles.notice} role="status">
              {t.pending}
            </p>
          )}

          {visible.length === 0 ? (
            <p className={styles.empty} role="status">
              {ready ? t.emptyCat : t.loading}
            </p>
          ) : (
            <section className={styles.grid} aria-label={t.blog}>
              {visible.map((p) => (
                <Card key={p.slug} post={p} lang={lang} />
              ))}
            </section>
          )}
          {source === 'ejemplo' && <p className={styles.example}>{t.example}</p>}
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
    </SettingsProvider>
  );
}
