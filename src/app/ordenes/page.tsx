export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import { EstadoBadge } from "@/components/estado-badge";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, Eye, Check } from "lucide-react";
import { OrdersFilter } from "./orders-filter";
import { DashboardEntregarBtn } from "@/components/dashboard-entregar-btn";

export default async function OrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string }>;
}) {
  const params = await searchParams;
  const ordenes = await getOrders({
    estado: params.estado as any,
    busqueda: params.q,
  });

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reparaciones</h1>
          <p className="text-gray-400 text-sm mt-1">
            {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""} totales
          </p>
        </div>
        <Link
          href="/ordenes/nueva"
          className="bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Orden
        </Link>
      </div>

      <OrdersFilter
        currentEstado={params.estado}
        currentQuery={params.q}
      />

      {ordenes.length === 0 ? (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-12 text-center">
          <p className="text-gray-500">No se encontraron órdenes</p>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-600 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Equipo</th>
                  <th className="px-4 py-3 text-left font-medium">Problema</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Presupuesto</th>
                  <th className="px-4 py-3 text-left font-medium">Ingreso</th>
                  <th className="px-4 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {ordenes.map((orden: any) => (
                  <tr key={orden.id} className="card-hover cursor-pointer">
                    <td className="px-4 py-3 font-mono text-gray-500">
                      {orden.numero}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{orden.cliente?.nombre}</div>
                      {orden.cliente?.dni && (
                        <div className="text-xs text-gray-500">
                          DNI: {orden.cliente.dni}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>{orden.dispositivo}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 max-w-48 truncate">
                      {orden.problema}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={orden.estado} />
                    </td>
                    <td className="px-4 py-3">
                      {orden.presupuesto ? (
                        <span className="font-medium">
                          ${orden.presupuesto.toLocaleString("es-AR")}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {format(new Date(orden.fecha_ingreso), "dd/MM", {
                        locale: es,
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/ordenes/${orden.id}`}
                          className="text-gray-500 hover:text-brand-teal p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {orden.estado === "finalizado" && (
                          <DashboardEntregarBtn ordenId={orden.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
