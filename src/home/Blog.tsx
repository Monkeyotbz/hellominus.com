import { POSTS } from './data';
import styles from './Blog.module.css';

export default function Blog() {
  return (
    <section id="blog" className={styles.wrap} aria-label="Blog">
      <div className={styles.head}>
        <p className={styles.hand}>desde la comunidad</p>
        <h2 className={styles.title}>Blog</h2>
      </div>
      <div className={styles.posts}>
        {POSTS.map((post) => (
          <a key={post.id} className={styles.post} href="#blog">
            <div className={styles.photo}>
              <img src={post.image} alt={post.alt} width={1200} height={800} loading="lazy" style={{ objectPosition: post.position }} />
            </div>
            <div className={styles.body}>
              <div className={styles.meta}>
                <span className={styles.topic}>{post.topic}</span>
                <span className={styles.read}>{post.minutes} min de lectura</span>
              </div>
              <h3 className={styles.name}>{post.title}</h3>
              <p>{post.excerpt}</p>
              <span className={styles.go}>Leer artículo</span>
            </div>
          </a>
        ))}
      </div>
      <a className={styles.all} href="#blog">
        Ver todo el blog
      </a>
      <p className={styles.example}>Artículos de ejemplo.</p>
    </section>
  );
}
