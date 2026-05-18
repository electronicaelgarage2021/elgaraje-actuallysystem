-- Migration: Add priority to orders
ALTER TABLE ordenes_reparacion ADD COLUMN IF NOT EXISTS prioridad boolean DEFAULT false;
