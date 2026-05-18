-- =============================================
-- Electrónica El Garage - Seed Data
-- Villa Carlos Paz, Córdoba, Argentina
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- Limpiar datos existentes (orden importa por FKs)
TRUNCATE repuestos, pagos, historial_estados, ordenes_reparacion, clientes, ventas, tareas CASCADE;

-- =============================================
-- 1. CLIENTES (15)
-- =============================================
WITH clientes_insert AS (
  INSERT INTO clientes (id, nombre, telefono, dni, created_at) VALUES
    ('a0000000-0001-4000-8000-000000000001', 'Carlos Mendoza',       '3541-612345', '28456789', now() - interval '40 days'),
    ('a0000000-0002-4000-8000-000000000002', 'María Fernández',      '3541-634567', '31234567', now() - interval '38 days'),
    ('a0000000-0003-4000-8000-000000000003', 'Jorge Ramírez',        '3541-678901', '25678901', now() - interval '35 days'),
    ('a0000000-0004-4000-8000-000000000004', 'Lucía Peralta',        '3541-601234', '33456123', now() - interval '33 days'),
    ('a0000000-0005-4000-8000-000000000005', 'Roberto Sánchez',      '3541-645678', '27890456', now() - interval '30 days'),
    ('a0000000-0006-4000-8000-000000000006', 'Ana Belén Torres',     '3541-689012', '30123789', now() - interval '28 days'),
    ('a0000000-0007-4000-8000-000000000007', 'Martín Aguirre',       '3541-623456', '35678234', now() - interval '25 days'),
    ('a0000000-0008-4000-8000-000000000008', 'Gabriela Ruiz',        '3541-667890', '29345678', now() - interval '22 days'),
    ('a0000000-0009-4000-8000-000000000009', 'Diego Molina',         '3541-611234', '32567890', now() - interval '20 days'),
    ('a0000000-0010-4000-8000-000000000010', 'Valentina Herrera',    '3541-655678', '34789012', now() - interval '18 days'),
    ('a0000000-0011-4000-8000-000000000011', 'Pedro Navarro',        '3541-699012', '26012345', now() - interval '15 days'),
    ('a0000000-0012-4000-8000-000000000012', 'Romina Gutiérrez',     '3541-643456', '36234567', now() - interval '12 days'),
    ('a0000000-0013-4000-8000-000000000013', 'Fernando López',       '3541-687890', '24567890', now() - interval '10 days'),
    ('a0000000-0014-4000-8000-000000000014', 'Camila Domínguez',     '3541-621234', '37890123', now() - interval '7 days'),
    ('a0000000-0015-4000-8000-000000000015', 'Raúl Giménez',         '3541-665678', '23123456', now() - interval '3 days')
  RETURNING *
)
SELECT count(*) AS clientes_insertados FROM clientes_insert;

-- =============================================
-- 2. ORDENES DE REPARACIÓN (20)
-- No incluimos "numero" (SERIAL auto-increment)
-- =============================================

-- Desactivar triggers temporalmente para manejar historial manualmente
ALTER TABLE ordenes_reparacion DISABLE TRIGGER USER;

-- --- ENTREGADO (7) - las más antiguas ---

INSERT INTO ordenes_reparacion (id, cliente_id, dispositivo, problema, observaciones, estado, presupuesto, sena, pago_total, fecha_ingreso, fecha_entregado, garantia, prioridad, created_at) VALUES
  -- Orden 1: entregado hace ~40 días, entregado hace ~30 días
  ('b0000000-0001-4000-8000-000000000001',
   'a0000000-0001-4000-8000-000000000001',
   'Samsung Galaxy A13', 'Pantalla rota', 'Caída desde 1.5m, táctil no responde',
   'entregado', 25000, 10000, 25000,
   now() - interval '40 days', now() - interval '30 days',
   '30 días', false,
   now() - interval '40 days'),

  -- Orden 2: entregado
  ('b0000000-0002-4000-8000-000000000002',
   'a0000000-0002-4000-8000-000000000002',
   'Motorola Moto G22', 'No carga', 'Probado con 3 cargadores distintos',
   'entregado', 12000, 5000, 12000,
   now() - interval '38 days', now() - interval '28 days',
   '60 días', false,
   now() - interval '38 days'),

  -- Orden 3: entregado
  ('b0000000-0003-4000-8000-000000000003',
   'a0000000-0003-4000-8000-000000000003',
   'iPhone 11', 'Batería hinchada', 'La tapa trasera se levantó, urgente',
   'entregado', 35000, 15000, 35000,
   now() - interval '35 days', now() - interval '25 days',
   '90 días', false,
   now() - interval '35 days'),

  -- Orden 4: entregado
  ('b0000000-0004-4000-8000-000000000004',
   'a0000000-0004-4000-8000-000000000004',
   'Notebook Lenovo IdeaPad', 'Teclado no funciona', 'Derramó café encima, varias teclas pegadas',
   'entregado', 18000, 8000, 18000,
   now() - interval '33 days', now() - interval '22 days',
   '30 días', false,
   now() - interval '33 days'),

  -- Orden 5: entregado
  ('b0000000-0005-4000-8000-000000000005',
   'a0000000-0005-4000-8000-000000000005',
   'TV LED Samsung 32"', 'No enciende', 'Se apagó durante tormenta eléctrica',
   'entregado', 22000, 10000, 22000,
   now() - interval '30 days', now() - interval '18 days',
   '60 días', false,
   now() - interval '30 days'),

  -- Orden 6: entregado
  ('b0000000-0006-4000-8000-000000000006',
   'a0000000-0006-4000-8000-000000000006',
   'Samsung Galaxy A03', 'Speaker no funciona', 'No suena en llamadas ni multimedia',
   'entregado', 8000, 4000, 8000,
   now() - interval '28 days', now() - interval '20 days',
   '30 días', false,
   now() - interval '28 days'),

  -- Orden 7: entregado
  ('b0000000-0007-4000-8000-000000000007',
   'a0000000-0007-4000-8000-000000000007',
   'Xiaomi Redmi Note 11', 'Se reinicia solo', 'Pasa cada 10-15 minutos, posible problema de software',
   'entregado', 5000, NULL, 5000,
   now() - interval '25 days', now() - interval '17 days',
   NULL, false,
   now() - interval '25 days');

-- --- FINALIZADO (4) - listas para retirar ---

INSERT INTO ordenes_reparacion (id, cliente_id, dispositivo, problema, observaciones, estado, presupuesto, sena, pago_total, fecha_ingreso, garantia, prioridad, created_at) VALUES
  -- Orden 8: finalizado
  ('b0000000-0008-4000-8000-000000000008',
   'a0000000-0008-4000-8000-000000000008',
   'iPhone 12', 'Display roto', 'Pantalla con líneas verdes después de golpe',
   'finalizado', 55000, 25000, NULL,
   now() - interval '14 days',
   NULL, false,
   now() - interval '14 days'),

  -- Orden 9: finalizado
  ('b0000000-0009-4000-8000-000000000009',
   'a0000000-0009-4000-8000-000000000009',
   'Motorola Moto G52', 'No conecta wifi', 'Dejó de funcionar después de actualización',
   'finalizado', 8500, NULL, NULL,
   now() - interval '12 days',
   NULL, false,
   now() - interval '12 days'),

  -- Orden 10: finalizado
  ('b0000000-0010-4000-8000-000000000010',
   'a0000000-0010-4000-8000-000000000010',
   'Tablet Samsung Galaxy Tab A7', 'No carga', 'Pin de carga suelto',
   'finalizado', 15000, 7000, NULL,
   now() - interval '10 days',
   NULL, true,
   now() - interval '10 days'),

  -- Orden 11: finalizado
  ('b0000000-0011-4000-8000-000000000011',
   'a0000000-0011-4000-8000-000000000011',
   'Samsung Galaxy A53', 'Botón power roto', 'Se hundió el botón, no responde',
   'finalizado', 9500, 4000, NULL,
   now() - interval '8 days',
   NULL, false,
   now() - interval '8 days');

-- --- EN REPARACIÓN (5) ---

INSERT INTO ordenes_reparacion (id, cliente_id, dispositivo, problema, observaciones, estado, presupuesto, sena, fecha_ingreso, prioridad, created_at) VALUES
  -- Orden 12: en_reparacion
  ('b0000000-0012-4000-8000-000000000012',
   'a0000000-0012-4000-8000-000000000012',
   'iPhone 13', 'Pantalla rota', 'Vidrio y LCD dañados, touch funciona parcialmente',
   'en_reparacion', 65000, 30000,
   now() - interval '7 days',
   true,
   now() - interval '7 days'),

  -- Orden 13: en_reparacion
  ('b0000000-0013-4000-8000-000000000013',
   'a0000000-0001-4000-8000-000000000001',
   'Notebook HP Pavilion', 'No enciende', 'Quedó sin batería y no arrancó más',
   'en_reparacion', 28000, 10000,
   now() - interval '10 days',
   false,
   now() - interval '10 days'),

  -- Orden 14: en_reparacion
  ('b0000000-0014-4000-8000-000000000014',
   'a0000000-0013-4000-8000-000000000013',
   'Xiaomi Poco X5', 'Display roto', 'Se sentó encima, pantalla negra',
   'en_reparacion', 32000, 15000,
   now() - interval '9 days',
   false,
   now() - interval '9 days'),

  -- Orden 15: en_reparacion
  ('b0000000-0015-4000-8000-000000000015',
   'a0000000-0005-4000-8000-000000000005',
   'Control remoto TV LG', 'Botón roto', 'Botón de volumen no responde, los demás andan',
   'en_reparacion', 5000, NULL,
   now() - interval '6 days',
   false,
   now() - interval '6 days'),

  -- Orden 16: en_reparacion
  ('b0000000-0016-4000-8000-000000000016',
   'a0000000-0009-4000-8000-000000000009',
   'TV LED Noblex 43"', 'Display roto', 'Le tiraron una pelota, media pantalla negra',
   'en_reparacion', 85000, 40000,
   now() - interval '5 days',
   false,
   now() - interval '5 days');

-- --- RECIBIDO (4) - últimos 3 días ---

INSERT INTO ordenes_reparacion (id, cliente_id, dispositivo, problema, observaciones, estado, presupuesto, sena, fecha_ingreso, prioridad, created_at) VALUES
  -- Orden 17: recibido
  ('b0000000-0017-4000-8000-000000000017',
   'a0000000-0014-4000-8000-000000000014',
   'Samsung Galaxy A14', 'No carga', 'Probó distintos cables, ninguno funciona',
   'recibido', NULL, NULL,
   now() - interval '3 days',
   false,
   now() - interval '3 days'),

  -- Orden 18: recibido
  ('b0000000-0018-4000-8000-000000000018',
   'a0000000-0015-4000-8000-000000000015',
   'Motorola Moto G73', 'Pantalla rota', 'Se cayó de la moto, vidrio y display rotos',
   'recibido', NULL, NULL,
   now() - interval '2 days',
   false,
   now() - interval '2 days'),

  -- Orden 19: recibido
  ('b0000000-0019-4000-8000-000000000019',
   'a0000000-0003-4000-8000-000000000003',
   'iPhone SE 2020', 'Batería hinchada', 'La pantalla se está separando del frame',
   'recibido', NULL, NULL,
   now() - interval '1 day',
   false,
   now() - interval '1 day'),

  -- Orden 20: recibido
  ('b0000000-0020-4000-8000-000000000020',
   'a0000000-0010-4000-8000-000000000010',
   'Xiaomi Redmi 12', 'Speaker no funciona', 'Solo funciona con auriculares',
   'recibido', NULL, NULL,
   now() - interval '6 hours',
   false,
   now() - interval '6 hours');

-- Reactivar triggers
ALTER TABLE ordenes_reparacion ENABLE TRIGGER USER;

-- =============================================
-- 3. HISTORIAL DE ESTADOS
-- Creamos el historial completo manualmente
-- =============================================

INSERT INTO historial_estados (orden_id, estado, created_at) VALUES
  -- Entregado #1 (Samsung A13): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0001-4000-8000-000000000001', 'recibido',       now() - interval '40 days'),
  ('b0000000-0001-4000-8000-000000000001', 'en_reparacion',  now() - interval '38 days'),
  ('b0000000-0001-4000-8000-000000000001', 'finalizado',     now() - interval '32 days'),
  ('b0000000-0001-4000-8000-000000000001', 'entregado',      now() - interval '30 days'),

  -- Entregado #2 (Moto G22): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0002-4000-8000-000000000002', 'recibido',       now() - interval '38 days'),
  ('b0000000-0002-4000-8000-000000000002', 'en_reparacion',  now() - interval '36 days'),
  ('b0000000-0002-4000-8000-000000000002', 'finalizado',     now() - interval '30 days'),
  ('b0000000-0002-4000-8000-000000000002', 'entregado',      now() - interval '28 days'),

  -- Entregado #3 (iPhone 11): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0003-4000-8000-000000000003', 'recibido',       now() - interval '35 days'),
  ('b0000000-0003-4000-8000-000000000003', 'en_reparacion',  now() - interval '33 days'),
  ('b0000000-0003-4000-8000-000000000003', 'finalizado',     now() - interval '27 days'),
  ('b0000000-0003-4000-8000-000000000003', 'entregado',      now() - interval '25 days'),

  -- Entregado #4 (Notebook Lenovo): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0004-4000-8000-000000000004', 'recibido',       now() - interval '33 days'),
  ('b0000000-0004-4000-8000-000000000004', 'en_reparacion',  now() - interval '30 days'),
  ('b0000000-0004-4000-8000-000000000004', 'finalizado',     now() - interval '25 days'),
  ('b0000000-0004-4000-8000-000000000004', 'entregado',      now() - interval '22 days'),

  -- Entregado #5 (TV Samsung 32"): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0005-4000-8000-000000000005', 'recibido',       now() - interval '30 days'),
  ('b0000000-0005-4000-8000-000000000005', 'en_reparacion',  now() - interval '27 days'),
  ('b0000000-0005-4000-8000-000000000005', 'finalizado',     now() - interval '20 days'),
  ('b0000000-0005-4000-8000-000000000005', 'entregado',      now() - interval '18 days'),

  -- Entregado #6 (Samsung A03): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0006-4000-8000-000000000006', 'recibido',       now() - interval '28 days'),
  ('b0000000-0006-4000-8000-000000000006', 'en_reparacion',  now() - interval '26 days'),
  ('b0000000-0006-4000-8000-000000000006', 'finalizado',     now() - interval '22 days'),
  ('b0000000-0006-4000-8000-000000000006', 'entregado',      now() - interval '20 days'),

  -- Entregado #7 (Xiaomi Redmi Note 11): recibido → en_reparacion → finalizado → entregado
  ('b0000000-0007-4000-8000-000000000007', 'recibido',       now() - interval '25 days'),
  ('b0000000-0007-4000-8000-000000000007', 'en_reparacion',  now() - interval '23 days'),
  ('b0000000-0007-4000-8000-000000000007', 'finalizado',     now() - interval '19 days'),
  ('b0000000-0007-4000-8000-000000000007', 'entregado',      now() - interval '17 days'),

  -- Finalizado #8 (iPhone 12): recibido → en_reparacion → finalizado
  ('b0000000-0008-4000-8000-000000000008', 'recibido',       now() - interval '14 days'),
  ('b0000000-0008-4000-8000-000000000008', 'en_reparacion',  now() - interval '12 days'),
  ('b0000000-0008-4000-8000-000000000008', 'finalizado',     now() - interval '3 days'),

  -- Finalizado #9 (Moto G52): recibido → en_reparacion → finalizado
  ('b0000000-0009-4000-8000-000000000009', 'recibido',       now() - interval '12 days'),
  ('b0000000-0009-4000-8000-000000000009', 'en_reparacion',  now() - interval '10 days'),
  ('b0000000-0009-4000-8000-000000000009', 'finalizado',     now() - interval '2 days'),

  -- Finalizado #10 (Tablet Samsung): recibido → en_reparacion → finalizado
  ('b0000000-0010-4000-8000-000000000010', 'recibido',       now() - interval '10 days'),
  ('b0000000-0010-4000-8000-000000000010', 'en_reparacion',  now() - interval '8 days'),
  ('b0000000-0010-4000-8000-000000000010', 'finalizado',     now() - interval '1 day'),

  -- Finalizado #11 (Samsung A53): recibido → en_reparacion → finalizado
  ('b0000000-0011-4000-8000-000000000011', 'recibido',       now() - interval '8 days'),
  ('b0000000-0011-4000-8000-000000000011', 'en_reparacion',  now() - interval '6 days'),
  ('b0000000-0011-4000-8000-000000000011', 'finalizado',     now() - interval '1 day'),

  -- En reparación #12 (iPhone 13): recibido → en_reparacion
  ('b0000000-0012-4000-8000-000000000012', 'recibido',       now() - interval '7 days'),
  ('b0000000-0012-4000-8000-000000000012', 'en_reparacion',  now() - interval '5 days'),

  -- En reparación #13 (Notebook HP): recibido → en_reparacion
  ('b0000000-0013-4000-8000-000000000013', 'recibido',       now() - interval '10 days'),
  ('b0000000-0013-4000-8000-000000000013', 'en_reparacion',  now() - interval '7 days'),

  -- En reparación #14 (Xiaomi Poco X5): recibido → en_reparacion
  ('b0000000-0014-4000-8000-000000000014', 'recibido',       now() - interval '9 days'),
  ('b0000000-0014-4000-8000-000000000014', 'en_reparacion',  now() - interval '6 days'),

  -- En reparación #15 (Control remoto LG): recibido → en_reparacion
  ('b0000000-0015-4000-8000-000000000015', 'recibido',       now() - interval '6 days'),
  ('b0000000-0015-4000-8000-000000000015', 'en_reparacion',  now() - interval '4 days'),

  -- En reparación #16 (TV Noblex 43"): recibido → en_reparacion
  ('b0000000-0016-4000-8000-000000000016', 'recibido',       now() - interval '5 days'),
  ('b0000000-0016-4000-8000-000000000016', 'en_reparacion',  now() - interval '3 days'),

  -- Recibido #17 (Samsung A14): solo recibido
  ('b0000000-0017-4000-8000-000000000017', 'recibido',       now() - interval '3 days'),

  -- Recibido #18 (Moto G73): solo recibido
  ('b0000000-0018-4000-8000-000000000018', 'recibido',       now() - interval '2 days'),

  -- Recibido #19 (iPhone SE): solo recibido
  ('b0000000-0019-4000-8000-000000000019', 'recibido',       now() - interval '1 day'),

  -- Recibido #20 (Xiaomi Redmi 12): solo recibido
  ('b0000000-0020-4000-8000-000000000020', 'recibido',       now() - interval '6 hours');


-- =============================================
-- 4. PAGOS (18 registros)
-- =============================================

INSERT INTO pagos (orden_id, monto, tipo, metodo, nota, created_at) VALUES
  -- Entregado #1 (Samsung A13) - seña + pago_final = 25000
  ('b0000000-0001-4000-8000-000000000001', 10000, 'sena',       'efectivo',       NULL,                        now() - interval '40 days'),
  ('b0000000-0001-4000-8000-000000000001', 15000, 'pago_final', 'transferencia',  'Transferencia Mercado Pago', now() - interval '30 days'),

  -- Entregado #2 (Moto G22) - seña + pago_final = 12000
  ('b0000000-0002-4000-8000-000000000002', 5000,  'sena',       'efectivo',       NULL,                        now() - interval '38 days'),
  ('b0000000-0002-4000-8000-000000000002', 7000,  'pago_final', 'debito',         NULL,                        now() - interval '28 days'),

  -- Entregado #3 (iPhone 11) - seña + pago_final = 35000
  ('b0000000-0003-4000-8000-000000000003', 15000, 'sena',       'transferencia',  'Alias JORGE.RAMIREZ.MP',    now() - interval '35 days'),
  ('b0000000-0003-4000-8000-000000000003', 20000, 'pago_final', 'efectivo',       NULL,                        now() - interval '25 days'),

  -- Entregado #4 (Notebook Lenovo) - seña + pago_final = 18000
  ('b0000000-0004-4000-8000-000000000004', 8000,  'sena',       'credito',        '3 cuotas sin interés',      now() - interval '33 days'),
  ('b0000000-0004-4000-8000-000000000004', 10000, 'pago_final', 'credito',        '3 cuotas sin interés',      now() - interval '22 days'),

  -- Entregado #5 (TV Samsung 32") - seña + pago_final = 22000
  ('b0000000-0005-4000-8000-000000000005', 10000, 'sena',       'efectivo',       NULL,                        now() - interval '30 days'),
  ('b0000000-0005-4000-8000-000000000005', 12000, 'pago_final', 'transferencia',  NULL,                        now() - interval '18 days'),

  -- Entregado #6 (Samsung A03) - pago completo al retirar = 8000
  ('b0000000-0006-4000-8000-000000000006', 4000,  'sena',       'efectivo',       NULL,                        now() - interval '28 days'),
  ('b0000000-0006-4000-8000-000000000006', 4000,  'pago_final', 'efectivo',       NULL,                        now() - interval '20 days'),

  -- Entregado #7 (Xiaomi Redmi Note 11) - pago completo (solo software)
  ('b0000000-0007-4000-8000-000000000007', 5000,  'pago_final', 'transferencia',  'Solo fue limpieza software', now() - interval '17 days'),

  -- Finalizado #8 (iPhone 12) - seña pagada, falta pago_final
  ('b0000000-0008-4000-8000-000000000008', 25000, 'sena',       'transferencia',  'Alias GABI.RUIZ.CVU',       now() - interval '14 days'),

  -- Finalizado #10 (Tablet Samsung) - seña pagada
  ('b0000000-0010-4000-8000-000000000010', 7000,  'sena',       'efectivo',       NULL,                        now() - interval '10 days'),

  -- Finalizado #11 (Samsung A53) - seña pagada
  ('b0000000-0011-4000-8000-000000000011', 4000,  'sena',       'debito',         NULL,                        now() - interval '8 days'),

  -- En reparación #12 (iPhone 13) - seña pagada
  ('b0000000-0012-4000-8000-000000000012', 30000, 'sena',       'transferencia',  'Transferencia bancaria',    now() - interval '7 days'),

  -- En reparación #13 (Notebook HP) - seña pagada
  ('b0000000-0013-4000-8000-000000000013', 10000, 'sena',       'efectivo',       NULL,                        now() - interval '10 days');


-- =============================================
-- 5. VENTAS DE PRODUCTOS (25)
-- =============================================

INSERT INTO ventas (producto, monto, metodo, nota, created_at) VALUES
  -- Día -30
  ('Cargador USB-C Samsung',          3500,  'efectivo',       NULL,                          now() - interval '30 days'),
  ('Vidrio templado Samsung A13',      1500,  'efectivo',       'Cliente de reparación',       now() - interval '30 days'),

  -- Día -27
  ('Cable HDMI 2m',                    4000,  'debito',         NULL,                          now() - interval '27 days'),

  -- Día -25
  ('Funda silicona Moto G22',          2500,  'efectivo',       NULL,                          now() - interval '25 days'),
  ('Cargador iPhone Lightning',        4500,  'transferencia',  NULL,                          now() - interval '25 days'),

  -- Día -22
  ('Auriculares Bluetooth',            8500,  'credito',        '3 cuotas',                    now() - interval '22 days'),

  -- Día -20
  ('Pendrive 64GB Kingston',           5500,  'efectivo',       NULL,                          now() - interval '20 days'),
  ('Cable USB-C a USB-C 1m',           2000,  'efectivo',       NULL,                          now() - interval '20 days'),

  -- Día -18
  ('Memoria SD 32GB',                  4000,  'debito',         NULL,                          now() - interval '18 days'),
  ('Pilas AA Duracell x4',             2500,  'efectivo',       NULL,                          now() - interval '18 days'),

  -- Día -15
  ('Control remoto TV universal',      6000,  'efectivo',       'Para TV Philips',             now() - interval '15 days'),
  ('Vidrio templado iPhone 12',        2000,  'efectivo',       NULL,                          now() - interval '15 days'),

  -- Día -12
  ('Cargador USB-C Motorola turbo',    5000,  'transferencia',  NULL,                          now() - interval '12 days'),
  ('Funda antigolpe iPhone 11',        3500,  'debito',         NULL,                          now() - interval '12 days'),

  -- Día -10
  ('Cable HDMI 5m',                    7000,  'efectivo',       NULL,                          now() - interval '10 days'),
  ('Pilas AAA Energizer x4',           2000,  'efectivo',       NULL,                          now() - interval '10 days'),

  -- Día -7
  ('Cargador USB-C 3A rápido',         4000,  'transferencia',  NULL,                          now() - interval '7 days'),
  ('Auriculares in-ear con cable',     3000,  'efectivo',       NULL,                          now() - interval '7 days'),
  ('Vidrio templado Moto G52',         1500,  'efectivo',       NULL,                          now() - interval '7 days'),

  -- Día -5
  ('Pendrive 128GB SanDisk',           9000,  'credito',        NULL,                          now() - interval '5 days'),
  ('Memoria SD 64GB Samsung',          6500,  'transferencia',  NULL,                          now() - interval '5 days'),

  -- Día -3
  ('Cargador iPhone USB-C a Lightning', 5500, 'efectivo',       NULL,                          now() - interval '3 days'),
  ('Funda silicona Samsung A14',        2500, 'efectivo',       'Compró con la reparación',    now() - interval '3 days'),

  -- Día -1
  ('Cable USB tipo C 2m',              2500,  'debito',         NULL,                          now() - interval '1 day'),
  ('Vidrio templado Xiaomi Redmi 12',  1800,  'efectivo',       NULL,                          now() - interval '1 day');


-- =============================================
-- 6. TAREAS DEL DÍA (5)
-- =============================================

INSERT INTO tareas (texto, completada, posicion, fecha, created_at) VALUES
  ('Llamar a Gabriela Ruiz por iPhone 12 finalizado',    true,  0, CURRENT_DATE, now() - interval '3 hours'),
  ('Revisar repuesto pantalla Xiaomi Poco X5',            true,  1, CURRENT_DATE, now() - interval '2 hours'),
  ('Preparar Moto G52 para entrega - Diego Molina',       false, 2, CURRENT_DATE, now() - interval '1 hour'),
  ('Limpiar mesada y organizar repuestos',                 false, 3, CURRENT_DATE, now()),
  ('Actualizar lista de precios accesorios',               false, 4, CURRENT_DATE, now());


-- =============================================
-- 7. REPUESTOS (8)
-- =============================================

INSERT INTO repuestos (nombre, orden_id, proveedor, pedido, created_at) VALUES
  -- Vinculados a órdenes, proveedor Córdoba
  ('Pantalla Samsung A14',      'b0000000-0017-4000-8000-000000000017', 'cordoba', false, now() - interval '2 days'),
  ('Display LCD iPhone 13',     'b0000000-0012-4000-8000-000000000012', 'cordoba', true,  now() - interval '6 days'),
  ('Flex power Xiaomi Poco X5', 'b0000000-0014-4000-8000-000000000014', 'cordoba', true,  now() - interval '5 days'),

  -- Proveedor VCP
  ('Batería Moto G73',          'b0000000-0018-4000-8000-000000000018', 'vcp',     false, now() - interval '1 day'),
  ('Pin de carga Samsung Tab A7','b0000000-0010-4000-8000-000000000010', 'vcp',     true,  now() - interval '8 days'),

  -- Sin proveedor asignado (stock o pendiente decidir)
  ('Display LCD TV 32" Samsung', NULL,                                   NULL,      false, now() - interval '10 days'),
  ('Táctil Samsung A03',         NULL,                                   NULL,      false, now() - interval '15 days'),
  ('Batería iPhone SE 2020',     'b0000000-0019-4000-8000-000000000019', NULL,      false, now() - interval '1 day');


-- =============================================
-- 8. Resetear secuencia del número de orden
-- =============================================
SELECT setval('ordenes_reparacion_numero_seq', (SELECT MAX(numero) FROM ordenes_reparacion));
