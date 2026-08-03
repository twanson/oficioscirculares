-- ============================================================
--  Club de Oficios Circulares — tabla de miembros (Supabase)
--  Ejecutar en el SQL Editor del proyecto de Supabase.
-- ============================================================

create table if not exists public.club_members (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  nombre text,                              -- nombre a mostrar en el hero (opcional; si NULL, no se muestra)
  status text not null default 'active',   -- active | canceled | past_due
  plan text,                                -- monthly | annual
  founder boolean default true,
  founder_number int,                       -- nº de plaza (1-40), lo asigna Jose
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Si la tabla ya existía sin la columna, añádela (idempotente):
alter table public.club_members add column if not exists nombre text;

-- Búsquedas rápidas por email (login) y por customer (webhook).
create unique index if not exists club_members_email_idx on public.club_members (lower(email));
create index if not exists club_members_customer_idx on public.club_members (stripe_customer_id);

-- RLS: nadie desde el cliente. Todo pasa por el servidor Express con la
-- service_role key (que bypassea RLS). Sin políticas => el anon key no ve nada.
alter table public.club_members enable row level security;

-- ============================================================
--  SEED de fundadores que YA pagaron antes de desplegar el webhook.
--  Rellena una fila por cada uno. IMPORTANTE: incluye stripe_customer_id
--  (lo ves en el dashboard de Stripe, empieza por cus_...) para que la
--  cancelación futura se sincronice sola; sin él, si cancelan habría que
--  ponerlos a 'canceled' a mano.
-- ============================================================
-- `nombre` es opcional: rellénalo para saludar por su nombre en el hero; si lo
-- dejas NULL, el hogar muestra solo "Bienvenido/a al taller".
-- insert into public.club_members (email, nombre, status, plan, founder, founder_number, stripe_customer_id)
-- values
--   ('fundador1@correo.com', 'Blanca', 'active', 'annual',  true, 1, 'cus_XXXXXXXX'),
--   ('fundador2@correo.com', NULL,     'active', 'monthly', true, 2, 'cus_YYYYYYYY')
-- on conflict (email) do update
--   set nombre = coalesce(excluded.nombre, public.club_members.nombre),
--       status = excluded.status,
--       plan = excluded.plan,
--       founder_number = coalesce(excluded.founder_number, public.club_members.founder_number),
--       stripe_customer_id = coalesce(excluded.stripe_customer_id, public.club_members.stripe_customer_id),
--       updated_at = now();
