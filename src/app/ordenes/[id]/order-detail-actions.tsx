"use client";

import { useState } from "react";
import { PaymentModal } from "@/components/payment-modal";
import { WhatsAppApprovalModal } from "@/components/whatsapp-approval-modal";
import { updateOrderEstado } from "@/lib/actions/orders";
import { ESTADOS, buildMensajeEntrega } from "@/lib/constants";
import type { EstadoOrden } from "@/lib/types";
import { DollarSign, Check, MessageCircle } from "lucide-react";

interface OrderDetailActionsProps {
  orden: any;
  totalPagado: number;
}

export function OrderDetailActions({
  orden,
  totalPagado,
}: OrderDetailActionsProps) {
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
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

  const canWhatsapp = orden.cliente?.telefono && orden.estado !== "recibido";
  const mensajeDefault = orden.cliente
    ? buildMensajeEntrega(orden.cliente.nombre, orden.dispositivo)
    : "";

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

        {canWhatsapp && (
          <button
            onClick={() => setWhatsappOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Avisar por WhatsApp
          </button>
        )}
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        ordenId={orden.id}
        presupuesto={orden.presupuesto}
        senaExistente={orden.sena}
      />

      {canWhatsapp && (
        <WhatsAppApprovalModal
          open={whatsappOpen}
          onClose={() => setWhatsappOpen(false)}
          telefono={orden.cliente.telefono}
          mensajeInicial={mensajeDefault}
          clienteNombre={orden.cliente.nombre}
        />
      )}
    </>
  );
}
