-- ============================================================
-- 20260619_01 — Endurecimiento de seguridad
-- Aplicada el 2026-06-19 vía SQL Editor.
-- Reversible. NO modifica datos existentes, solo agrega reglas.
-- ============================================================

-- 1) Trigger anti-borrado masivo: aborta cualquier DELETE de +50 filas.
create or replace function public.prevent_mass_delete()
returns trigger language plpgsql set search_path = '' as $$
declare n integer;
begin
  select count(*) into n from deleted_rows;
  if n > 50 then
    raise exception 'Borrado masivo bloqueado: % filas en %.% (max 50). Desactiva el trigger si es intencional.', n, tg_table_schema, tg_table_name;
  end if;
  return null;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['clientes','ordenes_reparacion','pagos','ventas','gastos','historial_estados','repuestos','tareas']
  loop
    execute format('drop trigger if exists trg_prevent_mass_delete on public.%I', t);
    execute format('create trigger trg_prevent_mass_delete after delete on public.%I referencing old table as deleted_rows for each statement execute function public.prevent_mass_delete()', t);
  end loop;
end $$;

-- 2) Constraints: montos nunca negativos.
alter table public.pagos  add constraint pagos_monto_no_neg  check (monto >= 0);
alter table public.ventas add constraint ventas_monto_no_neg check (monto >= 0);
alter table public.gastos add constraint gastos_monto_no_neg check (monto >= 0);
alter table public.ordenes_reparacion add constraint ordenes_montos_no_neg check (
  (presupuesto is null or presupuesto >= 0) and
  (sena is null or sena >= 0) and
  (pago_total is null or pago_total >= 0) and
  (costo_repuestos is null or costo_repuestos >= 0)
);

-- 3) Avisos del advisor: search_path fijo en funciones de trigger.
--    update_updated_at no toca tablas -> vacío; las log_* insertan en historial_estados -> public.
alter function public.update_updated_at()  set search_path = '';
alter function public.log_estado_change()  set search_path = public;
alter function public.log_initial_estado() set search_path = public;

-- 4) Quitar ejecución pública de rls_auto_enable (es event trigger, no API).
revoke execute on function public.rls_auto_enable() from public;

-- ROLLBACK:
--   drop trigger trg_prevent_mass_delete on public.clientes;  -- (idem cada tabla)
--   drop function public.prevent_mass_delete();
--   alter table public.pagos  drop constraint pagos_monto_no_neg;
--   alter table public.ventas drop constraint ventas_monto_no_neg;
--   alter table public.gastos drop constraint gastos_monto_no_neg;
--   alter table public.ordenes_reparacion drop constraint ordenes_montos_no_neg;
--   alter function public.update_updated_at()  reset search_path;
--   alter function public.log_estado_change()  reset search_path;
--   alter function public.log_initial_estado() reset search_path;
--   grant execute on function public.rls_auto_enable() to public;
