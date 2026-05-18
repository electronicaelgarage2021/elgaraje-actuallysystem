-- Migration: Tareas del día
CREATE TABLE tareas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  texto text NOT NULL,
  completada boolean DEFAULT false NOT NULL,
  posicion integer NOT NULL DEFAULT 0,
  fecha date DEFAULT CURRENT_DATE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_tareas_fecha ON tareas(fecha, posicion);

ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON tareas FOR ALL USING (true) WITH CHECK (true);
