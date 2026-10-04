import { useCallback, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { CITIES, type City } from './data';
import { useHomeStore } from './store';
import { useDismiss, useScrollSpy } from './hooks';
import { ChevronRightIcon, MenuIcon, SearchIcon } from './Icons';
import styles from './Header.module.css';
import { accountLabel, useAuth } from '../contexts/AuthContext';

type Panel = 'menu' | 'search' | null;

const SPY_IDS = ['estadia', 'completa', 'nomadas', 'blog'] as const;
const HEADER_ID = 'home-header';

const SEARCH_HITS: { label: string; href: string; city?: City }[] = [
  { label: 'Cartagena', href: '#estadia', city: 'Cartagena' },
  { label: 'Medellín', href: '#estadia', city: 'Medellín' },
  { label: 'Jardín, Antioquia', href: '#estadia', city: 'Jardín' },
  { label: 'Islas del Rosario', href: '#completa' },
  { label: 'Isla Cholón', href: '#completa' },
  { label: 'Hospedajes para trabajar', href: '#nomadas' },
];

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function Header() {
  const { user, homePath } = useAuth();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const spy = useScrollSpy(SPY_IDS);
  const setStayFilter = useHomeStore((s) => s.setStayFilter);
  const setCompleteTab = useHomeStore((s) => s.setCompleteTab);
  const menuId = useId();
  const searchId = useId();

  const close = useCallback(() => setPanel(null), []);
  useDismiss(panel !== null, HEADER_ID, close);

  const toggle = (next: Exclude<Panel, null>) => setPanel((current) => (current === next ? null : next));

  const q = normalize(query.trim());
  const hits = SEARCH_HITS.filter((hit) => !q || normalize(hit.label).includes(q));
  const knownCities: readonly string[] = CITIES;

  return (
    <header className={styles.header} id={HEADER_ID}>
      <div className={styles.topRow}>
        <div className={styles.toolsLeft}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={panel === 'menu'}
            aria-controls={menuId}
            aria-label="Abrir menú"
            onClick={() => toggle('menu')}
          >
            <MenuIcon className={styles.menuIcon} />
            <span className={styles.menuLabel}>Menú</span>
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            aria-expanded={panel === 'search'}
            aria-controls={searchId}
            aria-label="Buscar"
            onClick={() => toggle('search')}
          >
            <SearchIcon className={styles.icon} />
          </button>
        </div>

        <a className={styles.wordmark} href="#inicio" aria-label="Hellominus, inicio">
          Hellominus
        </a>

        <div className={styles.toolsRight}>
          {/* Acceso a la cuenta (en móvil vive dentro del menú, por espacio). */}
          <Link className={styles.account} to={user ? homePath : '/login'}>
            {user ? accountLabel(homePath) : 'Ingresar'}
          </Link>
          <a className={styles.reserve} href="#estadia">
            Reservar
          </a>
        </div>
      </div>

      <div className={styles.subnavWrap}>
        <nav className={styles.subnav} aria-label="Secciones">
          <a className={styles.place} href="#inicio">
            Colombia
            <ChevronRightIcon className={styles.placeIcon} />
          </a>
          <a className={styles.link} href="#estadia" aria-current={spy === 'estadia' ? 'true' : undefined}>
            Estadías
          </a>
          <a className={styles.link} href="#completa" aria-current={spy === 'completa' ? 'true' : undefined} onClick={() => setCompleteTab('planes')}>
            Planes y mercado
          </a>
          <a className={styles.link} href="#completa" onClick={() => setCompleteTab('mercado')}>
            Marketplace
          </a>
          <a className={styles.link} href="#nomadas" aria-current={spy === 'nomadas' ? 'true' : undefined}>
            Para nómadas
          </a>
          <a className={styles.link} href="#blog" aria-current={spy === 'blog' ? 'true' : undefined}>
            Blog
          </a>
        </nav>
      </div>

      {panel === 'menu' && (
        <nav id={menuId} className={`${styles.panel} ${styles.menuPanel}`} aria-label="Menú principal" onClick={close}>
          <a href="#estadia">Estadías</a>
          <a href="#completa" onClick={() => setCompleteTab('planes')}>
            Planes y mercado
          </a>
          <a href="#completa" onClick={() => setCompleteTab('mercado')}>
            Marketplace
          </a>
          <a href="#nomadas">Para nómadas</a>
          <a href="#blog">Blog</a>
          <Link className={styles.small} to="/hospedajes">
            Todos los hospedajes
          </Link>
          <Link className={styles.small} to="/tours">
            Todos los tours
          </Link>
          <Link className={styles.small} to="/nosotros">
            Nosotros
          </Link>
          <Link className={styles.small} to="/anfitriones">
            Publicar mi hospedaje
          </Link>
          <Link className={styles.small} to={user ? homePath : '/login'}>
            {user ? accountLabel(homePath) : 'Iniciar sesión'}
          </Link>
        </nav>
      )}

      {panel === 'search' && (
        <div id={searchId} className={`${styles.panel} ${styles.searchPanel}`} role="search">
          <label htmlFor={`${searchId}-input`}>Buscar destino o barrio</label>
          <input
            id={`${searchId}-input`}
            type="search"
            autoFocus
            autoComplete="off"
            placeholder="Cartagena, Medellín, Jardín…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className={styles.hits}>
            {hits.map((hit) => (
              <a
                key={hit.label}
                href={hit.href}
                onClick={() => {
                  if (hit.city && knownCities.includes(hit.city)) setStayFilter(hit.city);
                  if (hit.href === '#completa') setCompleteTab('planes');
                  close();
                }}
              >
                {hit.label}
              </a>
            ))}
          </div>
          {hits.length === 0 && <p className={styles.empty}>No hay resultados. Prueba con otra ciudad o barrio.</p>}
        </div>
      )}
    </header>
  );
}
