import { Link } from 'react-router-dom';
import { CATEGORIES, pick } from '../blog/data';
import { useBlogStore } from '../blog/store';
import styles from './Blog.module.css';

/** Tres artículos del blog en la portada. Cada tarjeta lleva a /blog/:slug. */
export default function Blog() {
  const posts = useBlogStore((s) => s.posts).slice(0, 3);
  const source = useBlogStore((s) => s.source);

  return (
    <section id="blog" className={`${styles.wrap} tone-stone`} aria-label="Blog">
      <div className={styles.head}>
        <p className={styles.hand}>desde la comunidad</p>
        <h2 className={styles.title}>Blog</h2>
      </div>
      <div className={styles.posts}>
        {posts.map((post) => (
          <Link key={post.slug} className={styles.post} to={`/blog/${post.slug}`}>
            <div className={styles.photo}>
              <img src={post.image} alt={post.alt} width={1200} height={800} loading="lazy" style={{ objectPosition: post.position }} />
            </div>
            <div className={styles.body}>
              <div className={styles.meta}>
                <span className={styles.topic}>{pick(CATEGORIES.find((c) => c.slug === post.category)?.name ?? { es: '' }, 'es')}</span>
                <span className={styles.read}>{post.minutes} min de lectura</span>
              </div>
              <h3 className={styles.name}>{pick(post.title, 'es')}</h3>
              <p>{pick(post.excerpt, 'es')}</p>
              <span className={styles.go}>Leer artículo</span>
            </div>
          </Link>
        ))}
      </div>
      <Link className={styles.all} to="/blog">
        Ver todo el blog
      </Link>
      {source === 'ejemplo' && <p className={styles.example}>Artículos de ejemplo.</p>}
    </section>
  );
}
