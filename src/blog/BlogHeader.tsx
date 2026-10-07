import { useCallback, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { MenuIcon, SearchIcon } from '../home/Icons';
import { useDismiss } from '../home/hooks';
import { CATEGORIES, UI, pick } from './data';
import { useBlogStore } from './store';
import styles from './BlogHeader.module.css';

const HEADER_ID = 'blog-header';

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.globe}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Encabezado beige de la portada con las categorías del blog en píldora (estructura de Booking). */
export default function BlogHeader() {
  const lang = useBlogStore((s) => s.lang);
  const setLang = useBlogStore((s) => s.setLang);
  const category = useBlogStore((s) => s.category);
  const setCategory = useBlogStore((s) => s.setCategory);
  const query = useBlogStore((s) => s.query);
  const setQuery = useBlogStore((s) => s.setQuery);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuId = useId();
  const t = UI[lang];

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useDismiss(menuOpen, HEADER_ID, closeMenu);

  return (
    <header className={styles.header} id={HEADER_ID}>
      <div className={styles.top}>
        <div className={styles.left}>
          <button type="button" className={styles.menuBtn} aria-expanded={menuOpen} aria-controls={menuId} aria-label={t.menu} onClick={() => setMenuOpen((o) => !o)}>
            <MenuIcon className={styles.menuIcon} />
            <span className={styles.menuLabel}>{t.menu}</span>
          </button>
          <button
            type="button"
            className={styles.lang}
            aria-pressed={lang === 'en'}
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          >
            <GlobeIcon />
            <span>{lang === 'es' ? t.translate : t.untranslate}</span>
          </button>
        </div>

        <Link className={styles.wordmark} to="/" aria-label="Hellominus">
          Hellominus
        </Link>

        <div className={styles.right}>
          <Link className={styles.link} to="/anfitriones">
            {t.publish}
          </Link>
          <Link className={styles.link} to="/login">
            {t.signIn}
          </Link>
          <Link className={styles.reserve} to="/#estadia">
            {t.reserve}
          </Link>
        </div>
      </div>

      <div className={styles.subnav}>
        <div className={styles.tabs} role="tablist" aria-label="Categorías del blog">
          <button type="button" role="tab" className={styles.tab} aria-selected={category === 'todo'} onClick={() => setCategory('todo')}>
            {t.all}
          </button>
          {CATEGORIES.map((c) => (
            <button key={c.slug} type="button" role="tab" className={styles.tab} aria-selected={category === c.slug} onClick={() => setCategory(c.slug)}>
              {pick(c.name, lang)}
            </button>
          ))}
          <button type="button" className={`${styles.tab} ${styles.searchBtn}`} aria-label={t.search} aria-expanded={searchOpen} onClick={() => setSearchOpen((o) => !o)}>
            <SearchIcon className={styles.searchIcon} />
          </button>
        </div>
        {searchOpen && (
          <div className={styles.searchRow} role="search">
            <label htmlFor="blog-q" className={styles.srOnly}>
              {t.search}
            </label>
            <input id="blog-q" type="search" autoFocus autoComplete="off" placeholder={t.searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        )}
      </div>

      {menuOpen && (
        <nav id={menuId} className={styles.panel} aria-label={t.menu} onClick={closeMenu}>
          <Link to="/#estadia">{t.stays}</Link>
          <Link to="/#completa">{t.plans}</Link>
          <Link to="/#completa">{t.market}</Link>
          <Link to="/#nomadas">{t.nomads}</Link>
          <Link to="/blog">{t.blog}</Link>
          <Link className={styles.small} to="/hospedajes">
            {t.allStays}
          </Link>
          <Link className={styles.small} to="/tours">
            {t.allTours}
          </Link>
          <Link className={styles.small} to="/nosotros">
            {t.about}
          </Link>
          <Link className={styles.small} to="/anfitriones">
            {t.publish}
          </Link>
          <Link className={styles.small} to="/login">
            {t.signIn}
          </Link>
        </nav>
      )}
    </header>
  );
}
