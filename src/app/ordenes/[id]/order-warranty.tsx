"use client";

import { updateOrderWarranty } from "@/lib/actions/orders";
import { WarrantyConfig } from "@/components/warranty-config";

export function OrderWarranty({ ordenId, currentWarranty }: { ordenId: string; currentWarranty: string | null }) {
  async function handleSave(warranty: string) {
    await updateOrderWarranty(ordenId, warranty);
  }

  return (
    <WarrantyConfig
      ordenId={ordenId}
      currentWarranty={currentWarranty}
      onSave={handleSave}
    />
  );
}
