export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import { CalendarView } from "./calendar-view";

export default async function CalendarioPage() {
  const ordenes = await getOrders();

  // Map orders to calendar entries by fecha_ingreso
  const entregas = ordenes
    .filter((o: any) => o.fecha_ingreso)
    .map((o: any) => ({
      id: o.id,
      numero: o.numero,
      dispositivo: o.dispositivo,
      clienteNombre: o.cliente?.nombre || "Sin cliente",
      fecha: o.fecha_ingreso.split("T")[0],
      estado: o.estado,
    }));

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Calendario</h1>
        <p className="text-gray-400 text-sm mt-1">
          Clickeá en un día para ver el resumen completo
        </p>
      </div>
      <CalendarView entregas={entregas} />
    </div>
  );
}
