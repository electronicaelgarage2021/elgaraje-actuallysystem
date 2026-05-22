export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { OrdersFilter } from "./orders-filter";

export default async function OrdenesPage() {
  const ordenes = await getOrders();

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Reparaciones</h1>
        <Link
          href="/ordenes/nueva"
          className="bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Orden
        </Link>
      </div>
      <OrdersFilter ordenes={ordenes as any} />
    </div>
  );
}
