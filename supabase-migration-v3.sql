-- Migration v3: Remove en_espera state
-- Update any orders currently in en_espera to recibido
UPDATE ordenes_reparacion SET estado = 'recibido' WHERE estado = 'en_espera';

-- Update the check constraint
ALTER TABLE ordenes_reparacion DROP CONSTRAINT IF EXISTS ordenes_reparacion_estado_check;
ALTER TABLE ordenes_reparacion ADD CONSTRAINT ordenes_reparacion_estado_check
  CHECK (estado IN ('recibido', 'en_reparacion', 'finalizado', 'entregado'));
