import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocale } from '../../lib/locale';
import { catalogImageUrl } from '../../lib/supabase';
import { getTenantPage, type TenantPage as Data } from '../../lib/queries';
import { Container, Money } from '../ui';
import { ExperienceCard, StayCard } from '../cards';
import ImageThumb from '../ImageThumb';

const SOCIAL_LABEL: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', youtube: 'YouTube' };

/**
 * Página pública de un propietario (/anfitrion/:slug): lo que él mismo carga
 * desde su panel — presentación, catálogo y blog.
 */
export default function TenantPage() {
  const { slug = '' } = useParams();
  const { t } = useLocale();
  const [data, setData] = useState<Data | null | undefined>(undefined);

  useEffect(() => {
    setData(undefined);
    getTenantPage(slug).then(setData);
  }, [slug]);

  useEffect(() => {
    if (data?.tenant) document.title = `${data.tenant.name} — Hellominus`;
  }, [data]);

  if (data === undefined) return <Container className="py-16 text-muted">Cargando…</Container>;
  if (data === null)
    return (
      <Container className="py-16">
        <h1 className="text-h2 text-ink">Este espacio no está disponible</h1>
        <p className="mt-2 text-muted">
          Puede que todavía esté en revisión. <Link to="/hospedajes" className="text-brand hover:underline">Ver hospedajes</Link>
        </p>
      </Container>
    );

  const { tenant, stays, tours, products, posts } = data;
  const social = Object.entries((tenant.social ?? {}) as Record<string, string>).filter(([, url]) => url);

  return (
    <div>
      <div className="relative h-56 bg-stone sm:h-72">
        {tenant.cover_path && <img src={catalogImageUrl(tenant.cover_path)} alt="" className="h-full w-full object-cover" />}
      </div>
      {/* relative: el logo se monta sobre la portada sin que esta lo tape. */}
      <Container className="relative -mt-12 pb-16">
        <div className="flex flex-wrap items-end gap-5">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-card border-4 border-surface bg-white">
            {tenant.logo_path && <img src={catalogImageUrl(tenant.logo_path)} alt={`Logo de ${tenant.name}`} className="h-full w-full object-cover" />}
          </div>
          <div className="pb-1">
            <h1 className="text-h1 text-ink">{tenant.name}</h1>
            {t(tenant.tagline) && <p className="text-muted">{t(tenant.tagline)}</p>}
          </div>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="space-y-12">
            {t(tenant.description) && <p className="max-w-prose whitespace-pre-line text-body text-ink">{t(tenant.description)}</p>}

            {stays.length > 0 && (
              <section>
                <h2 className="text-h2 text-ink">Hospedajes</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stays.map((s) => (
                    <StayCard key={s.id} stay={s} />
                  ))}
                </div>
              </section>
            )}

            {tours.length > 0 && (
              <section>
                <h2 className="text-h2 text-ink">Tours y planes</h2>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {tours.map((tour) => (
                    <ExperienceCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </section>
            )}

            {products.length > 0 && (
              <section>
                <h2 className="text-h2 text-ink">Mercado</h2>
                <div className="mt-6 grid grid-cols-2 gap-6 lg:grid-cols-3">
                  {products.map((p) => (
                    <article key={p.id}>
                      <ImageThumb images={p.images} label={t(p.name)} className="aspect-square" />
                      <h3 className="mt-3 font-semibold text-ink">{t(p.name)}</h3>
                      {t(p.summary) && <p className="text-[13px] text-muted">{t(p.summary)}</p>}
                      <div className="mt-1 text-sm">
                        <Money value={p.price} />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {posts.length > 0 && (
              <section>
                <h2 className="text-h2 text-ink">Blog</h2>
                <ul className="mt-6 divide-y divide-line border-y border-line">
                  {posts.map((post) => (
                    <li key={post.id} className="py-4">
                      <h3 className="text-h3 text-ink">{t(post.title)}</h3>
                      {t(post.excerpt) && <p className="mt-1 text-muted">{t(post.excerpt)}</p>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stays.length + tours.length + products.length === 0 && (
              <p className="text-muted">Este espacio todavía no tiene publicaciones.</p>
            )}
          </div>

          <aside className="h-fit space-y-3 rounded-card border border-line bg-white p-5 text-sm">
            {(tenant.city || tenant.region) && (
              <p className="flex items-center gap-1.5 text-ink">
                <MapPin className="h-4 w-4 text-brand" /> {[tenant.city, tenant.region].filter(Boolean).join(', ')}
              </p>
            )}
            {tenant.website && (
              <a href={tenant.website} target="_blank" rel="noopener noreferrer" className="block text-brand hover:underline">
                Sitio web
              </a>
            )}
            {social.map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="block text-brand hover:underline">
                {SOCIAL_LABEL[key] ?? key}
              </a>
            ))}
          </aside>
        </div>
      </Container>
    </div>
  );
}
