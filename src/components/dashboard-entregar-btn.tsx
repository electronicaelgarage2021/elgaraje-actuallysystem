"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { updateOrderEstado } from "@/lib/actions/orders";

export function DashboardEntregarBtn({ ordenId }: { ordenId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await updateOrderEstado(ordenId, "entregado");
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="ml-2 bg-brand-teal/15 hover:bg-brand-teal/30 text-brand-teal text-[0.6rem] font-semibold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 disabled:opacity-50"
    >
      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
      {loading ? "..." : "Entregar"}
    </button>
  );
}
