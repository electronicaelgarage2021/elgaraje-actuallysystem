-- ============================================================
-- 20260617_01 — Cerrar RLS (Etapa 1 de seguridad)
-- Aplicada el 2026-06-17 vía SQL Editor.
-- ============================================================
-- Contexto: las 8 tablas tenían una política `allow_all` que permitía a la
-- anon key (pública, va en el navegador) leer/escribir/BORRAR toda la base.
-- Se eliminan esas políticas. RLS sigue HABILITADO en todas las tablas, así que
-- sin política el acceso queda denegado por defecto para anon/authenticated.
-- La app opera desde el servidor con la service_role key (bypassa RLS).

drop policy if exists "allow_all" on public.clientes;
drop policy if exists "allow_all" on public.ordenes_reparacion;
drop policy if exists "allow_all" on public.pagos;
drop policy if exists "allow_all" on public.ventas;
drop policy if exists "allow_all" on public.repuestos;
drop policy if exists "allow_all" on public.historial_estados;
drop policy if exists "allow_all" on public.tareas;
drop policy if exists "Allow all" on public.gastos;

-- ROLLBACK (NO recomendado — reabre la base a la anon key pública):
--   create policy "allow_all" on public.clientes          for all using (true) with check (true);
--   create policy "allow_all" on public.ordenes_reparacion for all using (true) with check (true);
--   create policy "allow_all" on public.pagos             for all using (true) with check (true);
--   create policy "allow_all" on public.ventas            for all using (true) with check (true);
--   create policy "allow_all" on public.repuestos         for all using (true) with check (true);
--   create policy "allow_all" on public.historial_estados for all using (true) with check (true);
--   create policy "allow_all" on public.tareas            for all using (true) with check (true);
--   create policy "Allow all" on public.gastos            for all using (true) with check (true);
