export type EstadoOrden =
  | "recibido"
  | "en_reparacion"
  | "en_espera"
  | "finalizado"
  | "entregado";

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  dni: string | null;
  email: string | null;
  notas: string | null;
  created_at: string;
}

export interface OrdenReparacion {
  id: string;
  numero: number;
  cliente_id: string;
  dispositivo: string;
  problema: string;
  observaciones: string | null;
  estado: EstadoOrden;
  presupuesto: number | null;
  costo_repuestos: number | null;
  sena: number | null;
  pago_total: number | null;
  fecha_ingreso: string;
  fecha_entrega_estimada: string | null;
  fecha_entregado: string | null;
  garantia: string | null;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
}

export interface HistorialEstado {
  id: string;
  orden_id: string;
  estado: EstadoOrden;
  nota: string | null;
  created_at: string;
}

export interface Pago {
  id: string;
  orden_id: string;
  monto: number;
  tipo: "sena" | "pago_final";
  metodo: "efectivo" | "transferencia" | "debito" | "credito";
  nota: string | null;
  created_at: string;
}

export type OrdenConCliente = OrdenReparacion & {
  cliente: Cliente;
};
