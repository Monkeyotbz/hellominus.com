import { useState } from 'react';
import Button from './Button';
import { PLANS, PRODUCTS, formatCop } from './data';
import { Section, SectionHead, ExampleNote } from './Section';
import { useHomeStore, type CompleteTab } from './store';
import styles from './Complete.module.css';

const TABS: { id: CompleteTab; label: string }[] = [
  { id: 'planes', label: 'Planes de turismo' },
  { id: 'mercado', label: 'Mercado' },
];

export default function Complete() {
  const tab = useHomeStore((s) => s.completeTab);
  const setTab = useHomeStore((s) => s.setCompleteTab);
  const [added, setAdded] = useState<ReadonlySet<string>>(new Set());

  const toggle = (id: string) =>
    setAdded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addButton = (id: string, name: string) => (
    <Button variant="ghost" size="sm" aria-pressed={added.has(id)} aria-label={`${added.has(id) ? 'Quitar' : 'Agregar'} ${name}`} onClick={() => toggle(id)}>
      {added.has(id) ? 'Agregado' : 'Agregar'}
    </Button>
  );

  return (
    <Section id="completa">
      <SectionHead hand="suma a tu reserva" title="Completa tu estadía" />
      <div className={styles.tabs} role="tablist" aria-label="Planes y mercado">
        {TABS.map((item) => (
          <button
            key={item.id}
            id={`completa-tab-${item.id}`}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={tab === item.id}
            aria-controls={`completa-panel-${item.id}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div id="completa-panel-planes" role="tabpanel" aria-labelledby="completa-tab-planes" hidden={tab !== 'planes'}>
        <div className={styles.list}>
          {PLANS.map((plan) => (
            <div key={plan.id} className={styles.row}>
              <img src={plan.image} alt={plan.alt} width={200} height={200} loading="lazy" />
              <div className={styles.info}>
                <b>{plan.title}</b>
                <span>
                  {plan.detail} · {formatCop(plan.price)}
                </span>
              </div>
              {addButton(plan.id, plan.title)}
            </div>
          ))}
        </div>
      </div>

      <div id="completa-panel-mercado" role="tabpanel" aria-labelledby="completa-tab-mercado" hidden={tab !== 'mercado'}>
        <div className={styles.list}>
          {PRODUCTS.map((product) => (
            <div key={product.id} className={styles.row}>
              <span className={styles.swatch} aria-hidden="true">
                {product.kind}
              </span>
              <div className={styles.info}>
                <b>{product.title}</b>
                <span>
                  {product.detail} · {formatCop(product.price)}
                </span>
              </div>
              {addButton(product.id, product.title)}
            </div>
          ))}
        </div>
      </div>

      <ExampleNote>Precios y productos de ejemplo.</ExampleNote>
      <div className={styles.cta}>
        <Button href="#estadia">Reservar mi estadía</Button>
      </div>
    </Section>
  );
}
