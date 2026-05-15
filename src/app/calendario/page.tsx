export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import { CalendarView } from "./calendar-view";

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const ordenes = await getOrders();

  const entregas = ordenes
    .filter((o: any) => o.fecha_entrega_estimada && o.estado !== "entregado")
    .map((o: any) => ({
      id: o.id,
      numero: o.numero,
      dispositivo: o.dispositivo,
      clienteNombre: o.cliente?.nombre || "Sin cliente",
      fecha: o.fecha_entrega_estimada,
      estado: o.estado,
    }));

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-gray-400 text-sm mt-1">Entregas estimadas por fecha</p>
      </div>
      <CalendarView entregas={entregas} initialMonth={params.mes} />
    </div>
  );
}
