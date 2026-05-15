import type { EstadoOrden } from "./types";

export const ESTADOS: {
  value: EstadoOrden;
  label: string;
  color: string;
  bgColor: string;
}[] = [
  {
    value: "recibido",
    label: "Recibido",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "en_reparacion",
    label: "En reparación",
    color: "text-purple-400",
    bgColor: "bg-purple-500/15 text-purple-400",
  },
  {
    value: "en_espera",
    label: "En espera",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/15 text-yellow-400",
  },
  {
    value: "finalizado",
    label: "Finalizado",
    color: "text-green-400",
    bgColor: "bg-green-500/15 text-green-400",
  },
  {
    value: "entregado",
    label: "Entregado",
    color: "text-gray-400",
    bgColor: "bg-gray-500/15 text-gray-400",
  },
];

export const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
] as const;

export const NEGOCIO = {
  nombre: "Electrónica El Garage",
  direccion: "Alem 43, Villa Carlos Paz",
  telefono: "",
  instagram: "@electronica.elgarage",
  horario: "Lun a Sab 9:30 a 13:00 y 17:00 a 20:30",
} as const;

export function getEstadoConfig(estado: EstadoOrden) {
  return ESTADOS.find((e) => e.value === estado) ?? ESTADOS[0];
}

export function getEstadoIndex(estado: EstadoOrden) {
  return ESTADOS.findIndex((e) => e.value === estado);
}

export function buildWhatsAppUrl(telefono: string, mensaje: string) {
  const tel = telefono.replace(/\D/g, "");
  const fullTel = tel.startsWith("54") ? tel : `54${tel}`;
  return `https://wa.me/${fullTel}?text=${encodeURIComponent(mensaje)}`;
}

export function buildMensajeEntrega(
  clienteNombre: string,
  dispositivo: string
) {
  return `Hola ${clienteNombre}! Te escribimos de ${NEGOCIO.nombre}. Tu ${dispositivo} ya esta listo para retirar. Estamos en ${NEGOCIO.direccion}, ${NEGOCIO.horario}. Te esperamos!`;
}
