-- Migration v2: Add garantia column to ordenes_reparacion
-- Make telefono nullable in clientes (for clients without phone)
-- Run in Supabase SQL Editor

ALTER TABLE ordenes_reparacion ADD COLUMN IF NOT EXISTS garantia text;

ALTER TABLE clientes ALTER COLUMN telefono DROP NOT NULL;
