-- ============================================================
-- 20260619_02 — Campo posicion para reordenar el Kanban
-- Aplicada el 2026-06-19 vía SQL Editor.
-- Seguro: agrega columna con default, no rompe datos.
-- ============================================================

alter table public.ordenes_reparacion
  add column if not exists posicion integer not null default 0;

-- Inicializar preservando el orden actual por estado (prioridad arriba, luego más reciente)
with ordenadas as (
  select id, row_number() over (
    partition by estado order by prioridad desc, fecha_ingreso desc
  ) as rn
  from public.ordenes_reparacion
)
update public.ordenes_reparacion o
set posicion = ordenadas.rn
from ordenadas
where o.id = ordenadas.id;

-- ROLLBACK:
--   alter table public.ordenes_reparacion drop column posicion;
