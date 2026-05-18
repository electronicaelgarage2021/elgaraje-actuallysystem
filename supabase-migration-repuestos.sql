-- Migration: Repuestos para proveedores
CREATE TABLE repuestos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  orden_id uuid REFERENCES ordenes_reparacion(id) ON DELETE SET NULL,
  proveedor text CHECK (proveedor IN ('cordoba', 'vcp', NULL)),
  pedido boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_repuestos_proveedor ON repuestos(proveedor);
CREATE INDEX idx_repuestos_pedido ON repuestos(pedido);

ALTER TABLE repuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON repuestos FOR ALL USING (true) WITH CHECK (true);
