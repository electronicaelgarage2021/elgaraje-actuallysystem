-- Electronica El Garage - Schema
-- Ejecutar en Supabase SQL Editor

-- Clientes
create table clientes (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  telefono text not null,
  dni text,
  email text,
  notas text,
  created_at timestamptz default now() not null
);

-- Ordenes de reparacion
create table ordenes_reparacion (
  id uuid default gen_random_uuid() primary key,
  numero serial unique,
  cliente_id uuid references clientes(id) on delete cascade not null,
  dispositivo text not null,
  problema text not null,
  observaciones text,
  estado text default 'recibido' not null check (estado in ('recibido', 'en_reparacion', 'en_espera', 'finalizado', 'entregado')),
  presupuesto numeric,
  costo_repuestos numeric,
  sena numeric,
  pago_total numeric,
  fecha_ingreso timestamptz default now() not null,
  fecha_entrega_estimada date,
  fecha_entregado timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Historial de estados
create table historial_estados (
  id uuid default gen_random_uuid() primary key,
  orden_id uuid references ordenes_reparacion(id) on delete cascade not null,
  estado text not null,
  nota text,
  created_at timestamptz default now() not null
);

-- Pagos
create table pagos (
  id uuid default gen_random_uuid() primary key,
  orden_id uuid references ordenes_reparacion(id) on delete cascade not null,
  monto numeric not null,
  tipo text not null check (tipo in ('sena', 'pago_final')),
  metodo text not null check (metodo in ('efectivo', 'transferencia', 'debito', 'credito')),
  nota text,
  created_at timestamptz default now() not null
);

-- Indices
create index idx_ordenes_estado on ordenes_reparacion(estado);
create index idx_ordenes_cliente on ordenes_reparacion(cliente_id);
create index idx_ordenes_fecha on ordenes_reparacion(fecha_ingreso desc);
create index idx_historial_orden on historial_estados(orden_id);
create index idx_pagos_orden on pagos(orden_id);
create index idx_clientes_nombre on clientes(nombre);
create index idx_clientes_dni on clientes(dni);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger ordenes_updated_at
  before update on ordenes_reparacion
  for each row execute function update_updated_at();

-- Auto-insert historial on estado change
create or replace function log_estado_change()
returns trigger as $$
begin
  if old.estado is distinct from new.estado then
    insert into historial_estados (orden_id, estado)
    values (new.id, new.estado);
  end if;
  if new.estado = 'entregado' and old.estado != 'entregado' then
    new.fecha_entregado = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger ordenes_estado_change
  before update on ordenes_reparacion
  for each row execute function log_estado_change();

-- Insert initial estado on new order
create or replace function log_initial_estado()
returns trigger as $$
begin
  insert into historial_estados (orden_id, estado)
  values (new.id, new.estado);
  return new;
end;
$$ language plpgsql;

create trigger ordenes_initial_estado
  after insert on ordenes_reparacion
  for each row execute function log_initial_estado();

-- RLS: Allow all for now (no auth)
alter table clientes enable row level security;
alter table ordenes_reparacion enable row level security;
alter table historial_estados enable row level security;
alter table pagos enable row level security;

create policy "allow_all" on clientes for all using (true) with check (true);
create policy "allow_all" on ordenes_reparacion for all using (true) with check (true);
create policy "allow_all" on historial_estados for all using (true) with check (true);
create policy "allow_all" on pagos for all using (true) with check (true);
