"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelOrder } from "@/lib/actions/orders";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

export function OrderBottomActions({ ordenId }: { ordenId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleCancel() {
    if (!confirm("¿Cancelar esta reparación? Se eliminará la orden y no se puede deshacer.")) return;
    setDeleting(true);
    await cancelOrder(ordenId);
    router.push("/ordenes");
  }

  return (
    <div className="flex gap-2 pb-8">
      <Link
        href={`/ordenes/${ordenId}/editar`}
        className="flex-1 bg-surface-700 hover:bg-surface-600 text-gray-300 font-medium py-2.5 rounded-lg text-sm transition-colors text-center flex items-center justify-center gap-2"
      >
        <Pencil className="w-4 h-4" />
        Editar orden
      </Link>
      <button
        onClick={handleCancel}
        disabled={deleting}
        className="flex-1 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? "Eliminando..." : "Cancelar reparación"}
      </button>
    </div>
  );
}
