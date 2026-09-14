# Hellominus.com

## Qué es

Hellominus es un **marketplace de turismo y hospedaje en Colombia** que conecta viajeros directamente con anfitriones y operadores locales — tours, hospedajes y destinos en un solo lugar, con reserva directa y sin comisiones.

## Para quién

El producto está pensado para ser usable por cualquiera, no solo por "viajeros digitales":

- Familias que viajan con chicos.
- Personas mayores que prefieren llamar o escribir por WhatsApp antes que llenar formularios.
- Viajeros de trabajo que necesitan resolver rápido.
- Trabajadores remotos que buscan conectividad, espacio para trabajar y estadías largas.

## La oferta

| Vertical | Qué incluye |
|---|---|
| **Tours** | Experiencias guiadas por gente de la región, cupos reducidos ("Originales Hellominus") |
| **Hospedajes** | Hoteles, apartamentos, casas, cabañas, fincas y glamping |
| **Destinos** | Guías por región para descubrir qué hacer en cada lugar |

Catálogo actual (operador base "Turismo Colombia"):

- **7 destinos**: Cartagena, Medellín, Jardín, Jericó, Guatapé, San Jerónimo, Huila
- **14 hospedajes**
- **32 tours** (15 en Cartagena, 9 en Medellín, 8 en Jardín)

### Cómo se diferencia

1. **Anfitriones locales** — la experiencia la arma quien vive en el lugar y lo conoce de verdad, no una agencia intermediaria.
2. **Precio claro, sin sorpresas** — el viajero ve el total antes de reservar, sin cargos que aparecen al final.
3. **Reserva directa, sin comisiones** — sin el margen que agregan las OTAs tradicionales.
4. **Una persona te responde** — soporte por WhatsApp con alguien que puede resolver, no un bot ni un ticket.

## Cómo está construido

- **Frontend**: React + Vite + Tailwind, sitio bilingüe (ES/EN).
- **Backend de catálogo**: Supabase separado ("candyCRM") con arquitectura **multitenant** — el catálogo (destinos, hospedajes, tours, eventos, propiedades) vive por `tenant_id`, pensado para poder alojar más de un operador turístico a futuro. Hoy el sitio público sirve un único tenant (Turismo Colombia).
- **Backend de plataforma**: Supabase propio del sitio para cuentas de usuario, leads, newsletter y configuración (`site_settings`).
- **Panel admin** (`/admin`): CRUD completo para destinos, hospedajes, tours, eventos, propiedades (venta/arriendo), testimonios y blog — con carga de imágenes por ítem.
- **Captura de leads**: formulario de WhatsApp integrado en el sitio para quien prefiere que le arme el plan un asesor en vez de reservar solo.

### Contenido con soporte en el admin pero sin sección pública todavía

- **Eventos**
- **Propiedades en venta/arriendo** (real estate)

## Estado

Producto en reconstrucción activa post-pivote (dejó de ser una consultora de IA para convertirse en este marketplace). El catálogo de contenido real vive en `catalog/` (fuente de verdad `catalog.json`) y se siembra a la base vía `catalog/build-sql.mjs` + `catalog/upload-images.mjs`.
