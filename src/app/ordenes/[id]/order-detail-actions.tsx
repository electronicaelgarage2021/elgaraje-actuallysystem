"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/payment-modal";
import { updateOrderEstado } from "@/lib/actions/orders";
import { ESTADOS, buildWhatsAppUrl, buildMensajeEntrega } from "@/lib/constants";
import type { EstadoOrden } from "@/lib/types";
import { DollarSign, Check } from "lucide-react";

interface OrderDetailActionsProps {
  orden: any;
  totalPagado: number;
}

export function OrderDetailActions({
  orden,
  totalPagado,
}: OrderDetailActionsProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleEstadoChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setUpdating(true);
    await updateOrderEstado(orden.id, e.target.value as EstadoOrden);
    setUpdating(false);
  }

  async function handleEntregado() {
    setUpdating(true);
    await updateOrderEstado(orden.id, "entregado");
    setUpdating(false);
  }

  const whatsappUrl =
    orden.cliente?.telefono &&
    (orden.estado === "finalizado" || orden.estado === "entregado")
      ? buildWhatsAppUrl(
          orden.cliente.telefono,
          buildMensajeEntrega(orden.cliente.nombre, orden.dispositivo)
        )
      : null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={orden.estado}
          onChange={handleEstadoChange}
          disabled={updating}
          className="bg-surface-700 border border-surface-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 disabled:opacity-50"
        >
          {ESTADOS.map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </select>

        {orden.estado === "finalizado" && (
          <button
            onClick={handleEntregado}
            disabled={updating}
            className="btn-entregar text-surface-900 font-bold py-2.5 px-5 rounded-xl text-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
            Marcar como Entregado
          </button>
        )}

        <button
          onClick={() => setPaymentOpen(true)}
          disabled={orden.estado === "entregado"}
          className="bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <DollarSign className="w-4 h-4" />
          Registrar Pago
        </button>

        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Avisar por WhatsApp
          </a>
        )}
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        ordenId={orden.id}
        presupuesto={orden.presupuesto}
        senaExistente={orden.sena}
      />
    </>
  );
}
