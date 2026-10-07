import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SettingsProvider } from '../site/SettingsContext';
import Footer from '../home/Footer';
import WhatsAppFab from '../home/WhatsAppFab';
import '../home/tokens.css';
import BlogHeader from './BlogHeader';
import { AUTHOR, AUTHOR_NOTE, CATEGORIES, UI, formatDate, hasTranslation, pick } from './data';
import { useBlogStore } from './store';
import { useBlogData } from './useBlogData';
import { useMeta } from './useMeta';
import styles from './PostPage.module.css';

/** Muestra el cuerpo (Markdown simple): párrafos, títulos "## " y listas "- ". */
function renderBody(text: string): ReactNode[] {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith('## ')) return <h2 key={i}>{block.slice(3)}</h2>;
      const lines = block.split('\n');
      if (lines.every((l) => l.startsWith('- '))) {
        return (
          <ul key={i}>
            {lines.map((l) => (
              <li key={l}>{l.slice(2)}</li>
            ))}
          </ul>
        );
      }
      return <p key={i}>{block}</p>;
    });
}

export default function PostPage() {
  const { slug } = useParams();
  const { ready } = useBlogData();
  const lang = useBlogStore((s) => s.lang);
  const posts = useBlogStore((s) => s.posts);
  const t = UI[lang];
  const post = posts.find((p) => p.slug === slug);

  useMeta({
    title: post ? `${pick(post.title, lang)} — Blog Hellominus` : 'Blog — Hellominus',
    description: post ? pick(post.excerpt, lang) : '',
    path: `/blog/${slug ?? ''}`,
    image: post?.image,
  });

  const category = post ? CATEGORIES.find((c) => c.slug === post.category) : undefined;

  return (
    <SettingsProvider>
      <div className="home-root" id="top">
        <BlogHeader />
        <main className={styles.main}>
          <Link className={styles.back} to="/blog">
            ← {t.back}
          </Link>
          {!post ? (
            <p className={styles.empty} role="status">
              {ready ? t.notFound : t.loading}
            </p>
          ) : (
            <article className={styles.article}>
              <div className={styles.meta}>
                <span className={styles.cat}>{category ? pick(category.name, lang) : ''}</span>
                <span>
                  {t.reading}: {post.minutes} {t.minutes}
                </span>
              </div>
              <h1>{pick(post.title, lang)}</h1>
              <p className={styles.lead}>{pick(post.excerpt, lang)}</p>
              <div className={styles.by}>
                <span className={styles.avatar} aria-hidden="true">
                  RH
                </span>
                <span>
                  {t.by} {pick(AUTHOR, lang)} · {t.published} {formatDate(post.publishedAt, lang)}
                  <br />
                  <small>{pick(AUTHOR_NOTE, lang)}</small>
                </span>
              </div>
              {lang === 'en' && !hasTranslation(post.title) && (
                <p className={styles.notice} role="status">
                  {t.pending}
                </p>
              )}
              <div className={styles.cover}>
                <img src={post.image} alt={post.alt} width={1400} height={790} style={{ objectPosition: post.position }} />
              </div>
              <div className={styles.body}>{renderBody(pick(post.body, lang))}</div>
            </article>
          )}
        </main>
        <Footer />
        <WhatsAppFab />
      </div>
    </SettingsProvider>
  );
}
