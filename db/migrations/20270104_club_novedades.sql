-- ============================================================
--  Club de Oficios Circulares · Novedades de enero de 2027
--  Aplicar el 4 de enero de 2027, DESPUÉS de restaurar el proyecto de Supabase
--  `club-oficios-circulares` (SQL Editor o `supabase db push`).
--  Requiere que exista public.club_members (db/club-members.sql).
--  Idempotente: se puede ejecutar más de una vez sin romper nada.
--  Probada contra Postgres local (PGlite) el 21 de noviembre de 2026.
-- ============================================================

-- 1. Autodiagnóstico en el alta ------------------------------------------
--    nivel        : 'empieza' | 'publica' | 'vende'
--    itinerario   : slugs de las piezas en el orden recomendado (lib/clubContent.js)
--    prioridades  : las tres prioridades del primer mes, en orden
--    oficio       : clave del oficio del miembro (para el diagnóstico de ejemplo)
--    autodiagnostico_respuestas : respuestas en bruto, para revisar la regla
alter table public.club_members add column if not exists nivel text;
alter table public.club_members add column if not exists itinerario text[];
alter table public.club_members add column if not exists prioridades text[];
alter table public.club_members add column if not exists oficio text;
alter table public.club_members add column if not exists autodiagnostico_respuestas jsonb;
alter table public.club_members add column if not exists autodiagnostico_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'club_members_nivel_chk') then
    alter table public.club_members
      add constraint club_members_nivel_chk
      check (nivel is null or nivel in ('empieza', 'publica', 'vende'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'club_members_prioridades_chk') then
    alter table public.club_members
      add constraint club_members_prioridades_chk
      check (prioridades is null or array_length(prioridades, 1) <= 3);
  end if;
end $$;

-- 2. Votación de la lección del mes (un voto por miembro y ronda) ----------
--    ronda: 'AAAA-MM' del mes cuya lección se decide (p. ej. '2027-04').
create table if not exists public.club_votos (
  member_id  uuid not null references public.club_members(id) on delete cascade,
  ronda      text not null check (ronda ~ '^[0-9]{4}-[0-9]{2}$'),
  tema       text not null,
  created_at timestamptz not null default now(),
  primary key (member_id, ronda)
);
create index if not exists club_votos_ronda_idx on public.club_votos (ronda, tema);

-- Recuento por ronda (lo lee el servidor con la service role).
create or replace view public.club_votos_recuento as
  select ronda, tema, count(*)::int as votos
  from public.club_votos
  group by ronda, tema;

-- 3. Seguridad ----------------------------------------------------------------
--    Igual que club_members: RLS activada y sin políticas. Solo el servidor
--    (service role, que salta RLS) lee y escribe. El anon key no ve nada.
alter table public.club_votos enable row level security;
revoke all on public.club_votos_recuento from anon, authenticated;
