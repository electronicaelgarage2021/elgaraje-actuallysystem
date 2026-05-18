"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

interface DiscountSuggestionProps {
  clientName: string;
  orderCount: number;
  presupuesto: number | null;
}

export function DiscountSuggestion({ clientName, orderCount, presupuesto }: DiscountSuggestionProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || orderCount < 3 || !presupuesto) return null;

  const discountPercent = orderCount >= 5 ? 10 : 5;
  const discountAmount = Math.round(presupuesto * discountPercent / 100);

  return (
    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 flex items-start gap-3">
      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs font-medium text-purple-300">
          Cliente frecuente — {orderCount} reparaciones
        </p>
        <p className="text-[0.65rem] text-gray-400 mt-0.5">
          Sugerencia: {discountPercent}% de descuento a {clientName} (<span className="text-red-400">-${discountAmount.toLocaleString("es-AR")}</span>)
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-500 hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
