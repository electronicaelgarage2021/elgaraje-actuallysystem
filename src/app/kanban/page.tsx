export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import { KanbanBoard } from "./kanban-board";
import type { EstadoOrden } from "@/lib/types";

const COLUMNAS: { estado: EstadoOrden; label: string; color: string }[] = [
  { estado: "recibido", label: "Recibido", color: "blue" },
  { estado: "en_reparacion", label: "En reparación", color: "purple" },
  { estado: "finalizado", label: "Finalizado", color: "green" },
  { estado: "entregado", label: "Entregado", color: "gray" },
];

export default async function KanbanPage() {
  const ordenes = await getOrders();

  const columnas = COLUMNAS.map((col) => ({
    ...col,
    ordenes: ordenes.filter((o: any) => o.estado === col.estado),
  }));

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban</h1>
        <p className="text-gray-400 text-sm mt-1">
          Arrastrá las tarjetas para cambiar el estado
        </p>
      </div>
      <KanbanBoard initialColumnas={columnas} />
    </div>
  );
}
