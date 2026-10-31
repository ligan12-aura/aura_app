-- AURA — esquema de Supabase para proyectos por usuario
-- Ejecutar una sola vez en el SQL Editor del proyecto (Run). Es seguro volver a ejecutarlo.

-- 1. Proyectos: cada fila es un proyecto con sus elementos (datos de entrada, memoria .tex y estado) en JSON
create table if not exists public.proyectos (
  id          text primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre      text not null,
  calculista  text,
  oficina     text,
  mandante    text,
  fecha       text,
  datos       jsonb not null default '{}'::jsonb,
  creado      timestamptz not null default now(),
  modificado  timestamptz not null default now()
);
create index if not exists proyectos_user_idx on public.proyectos (user_id, modificado desc);

-- 2. Seguridad a nivel de fila: cada usuario ve y modifica solo sus proyectos
alter table public.proyectos enable row level security;

drop policy if exists "proyectos_select_propios" on public.proyectos;
drop policy if exists "proyectos_insert_propios" on public.proyectos;
drop policy if exists "proyectos_update_propios" on public.proyectos;
drop policy if exists "proyectos_delete_propios" on public.proyectos;
create policy "proyectos_select_propios" on public.proyectos for select to authenticated using (auth.uid() = user_id);
create policy "proyectos_insert_propios" on public.proyectos for insert to authenticated with check (auth.uid() = user_id);
create policy "proyectos_update_propios" on public.proyectos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "proyectos_delete_propios" on public.proyectos for delete to authenticated using (auth.uid() = user_id);

-- 3. Figuras PNG de las memorias: bucket privado, una carpeta por usuario (<user_id>/<proyecto>/<archivo>.png)
insert into storage.buckets (id, name, public)
values ('figuras', 'figuras', false)
on conflict (id) do nothing;

drop policy if exists "figuras_select_propias" on storage.objects;
drop policy if exists "figuras_insert_propias" on storage.objects;
drop policy if exists "figuras_update_propias" on storage.objects;
drop policy if exists "figuras_delete_propias" on storage.objects;
create policy "figuras_select_propias" on storage.objects for select to authenticated
  using (bucket_id = 'figuras' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "figuras_insert_propias" on storage.objects for insert to authenticated
  with check (bucket_id = 'figuras' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "figuras_update_propias" on storage.objects for update to authenticated
  using (bucket_id = 'figuras' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "figuras_delete_propias" on storage.objects for delete to authenticated
  using (bucket_id = 'figuras' and (storage.foldername(name))[1] = auth.uid()::text);
