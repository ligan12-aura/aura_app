-- AURA — actualización 1 del esquema (ejecutar una vez en el SQL Editor, después de esquema.sql)
-- 1. Versión de cada proyecto: evita que dos pestañas o dispositivos se pisen los cambios
alter table public.proyectos add column if not exists version integer not null default 1;

-- 2. El identificador del proyecto es único por usuario (un usuario no puede bloquear el id de otro)
alter table public.proyectos drop constraint if exists proyectos_pkey;
alter table public.proyectos add constraint proyectos_pkey primary key (user_id, id);

-- 3. Bucket de figuras: solo imágenes PNG de hasta 5 MB
update storage.buckets
set file_size_limit = 5242880, allowed_mime_types = array['image/png']
where id = 'figuras';
