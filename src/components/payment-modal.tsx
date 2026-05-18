"use client";

import { useState } from "react";
import { METODOS_PAGO } from "@/lib/constants";
import { registerPayment } from "@/lib/actions/orders";
import { X } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  ordenId: string;
  presupuesto: number | null;
  senaExistente: number | null;
}

export function PaymentModal({
  open,
  onClose,
  ordenId,
  presupuesto,
  senaExistente,
}: PaymentModalProps) {
  const [tipo, setTipo] = useState<"sena" | "pago_final">(
    senaExistente ? "pago_final" : "sena"
  );
  const [modoMonto, setModoMonto] = useState<"pesos" | "porcentaje">("pesos");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");
  const [marcarEntregado, setMarcarEntregado] = useState(false);
  const [loading, setLoading] = useState(false);

  const saldo = presupuesto ? presupuesto - (senaExistente || 0) : null;
  const montoFinal =
    modoMonto === "porcentaje" && presupuesto
      ? (Number(monto) / 100) * presupuesto
      : Number(monto);

  async function handleSubmit() {
    setLoading(true);
    const fd = new FormData();
    fd.set("orden_id", ordenId);
    fd.set("monto", String(montoFinal));
    fd.set("tipo", tipo);
    fd.set("metodo", metodo);
    fd.set("nota", "");
    fd.set("marcar_entregado", String(marcarEntregado));
    await registerPayment(fd);
    setLoading(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-5 border-b border-surface-600 flex items-center justify-between">
          <h2 className="font-semibold">Registrar Pago</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Summary */}
          <div className="bg-surface-700/50 rounded-lg p-3 text-sm">
            {presupuesto && (
              <div className="flex justify-between">
                <span className="text-gray-400">Presupuesto</span>
                <span className="font-medium">${presupuesto.toLocaleString("es-AR")}</span>
              </div>
            )}
            <div className="flex justify-between mt-1">
              <span className="text-gray-400">Seña previa</span>
              <span className="text-gray-500">${(senaExistente || 0).toLocaleString("es-AR")}</span>
            </div>
            {saldo !== null && (
              <div className="flex justify-between mt-1 pt-1 border-t border-surface-600">
                <span className="text-gray-400 font-medium">Saldo pendiente</span>
                <span className="font-bold text-red-400">${saldo.toLocaleString("es-AR")}</span>
              </div>
            )}
          </div>

          {/* Type toggle */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Tipo de pago</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo("sena")}
                disabled={!!senaExistente}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${tipo === "sena" ? "toggle-active" : "toggle-inactive"}`}
              >
                Seña (parcial)
              </button>
              <button
                type="button"
                onClick={() => setTipo("pago_final")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tipo === "pago_final" ? "toggle-active" : "toggle-inactive"}`}
              >
                Pago total
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Monto</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setModoMonto("pesos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${modoMonto === "pesos" ? "toggle-active" : "toggle-inactive"}`}
              >
                $ Pesos
              </button>
              <button
                type="button"
                onClick={() => setModoMonto("porcentaje")}
                disabled={!presupuesto}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 ${modoMonto === "porcentaje" ? "toggle-active" : "toggle-inactive"}`}
              >
                % del presupuesto
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                {modoMonto === "pesos" ? "$" : "%"}
              </span>
              <input
                type="number"
                placeholder={saldo ? String(saldo) : "0"}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder-gray-500"
              />
            </div>
            {modoMonto === "porcentaje" && monto && presupuesto && (
              <div className="text-xs text-gray-500 mt-1">
                = ${montoFinal.toLocaleString("es-AR")}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Método de pago</label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-300"
            >
              {METODOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mark as delivered */}
          <div className="flex items-center gap-3 p-3 bg-surface-700/50 rounded-lg">
            <input
              type="checkbox"
              id="mark-entregado"
              checked={marcarEntregado}
              onChange={(e) => setMarcarEntregado(e.target.checked)}
              className="w-4 h-4 rounded border-surface-500 accent-brand-teal"
            />
            <label htmlFor="mark-entregado" className="text-xs text-gray-300">
              Marcar como entregado al registrar el pago
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-surface-600 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!monto || loading}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal hover:bg-brand-teal-dark text-surface-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Confirmar Pago"}
          </button>
        </div>
      </div>
    </div>
  );
}
