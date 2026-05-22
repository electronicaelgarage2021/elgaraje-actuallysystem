"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder, returnWithoutRepair } from "@/lib/actions/orders";
import Link from "next/link";
import { Pencil, Trash2, Undo2 } from "lucide-react";

interface Props {
  ordenId: string;
  sena: number | null;
}

export function OrderBottomActions({ ordenId, sena }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [returning, setReturning] = useState(false);

  async function handleReturn() {
    const msg = sena && sena > 0
      ? `Se va a cancelar la seña de $${Number(sena).toLocaleString("es-AR")} y entregar el equipo sin reparación. ¿Confirmar?`
      : "El cliente no dejó seña. ¿Confirmar entrega sin reparación?";

    if (!confirm(msg)) return;
    setReturning(true);
    await returnWithoutRepair(ordenId);
    router.push("/ordenes");
  }

  async function handleCancel() {
    if (!confirm("¿Cancelar esta reparación? Se eliminará la orden y no se puede deshacer.")) return;
    setDeleting(true);
    await cancelOrder(ordenId);
    router.push("/ordenes");
  }

  return (
    <div className="space-y-2 pb-8">
      <div className="flex gap-2">
        <button
          onClick={handleReturn}
          disabled={returning}
          className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Undo2 className="w-4 h-4" />
          {returning ? "Procesando..." : "Entrega sin reparación"}
        </button>
        <button
          onClick={handleCancel}
          disabled={deleting}
          className="flex-1 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Eliminando..." : "Cancelar reparación"}
        </button>
      </div>
      <Link
        href={`/ordenes/${ordenId}/editar`}
        className="block w-full bg-surface-700 hover:bg-surface-600 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition-colors text-center flex items-center justify-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        Editar orden
      </Link>
    </div>
  );
}
