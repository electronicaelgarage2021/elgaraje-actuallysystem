-- Migration: Ventas de productos
CREATE TABLE ventas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  producto text NOT NULL,
  monto numeric NOT NULL,
  metodo text NOT NULL CHECK (metodo IN ('efectivo', 'transferencia', 'debito', 'credito')),
  nota text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_ventas_fecha ON ventas(created_at DESC);

ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON ventas FOR ALL USING (true) WITH CHECK (true);
