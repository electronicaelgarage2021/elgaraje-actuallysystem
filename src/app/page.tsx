export const dynamic = "force-dynamic";

import { getDashboardStats, getOrders } from "@/lib/actions/orders";
import { EstadoBadge } from "@/components/estado-badge";
import { Check, PlusCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DashboardEntregarBtn } from "@/components/dashboard-entregar-btn";
import { ExportButton } from "@/components/export-button";

export default async function Dashboard() {
  const [stats, ordenes] = await Promise.all([
    getDashboardStats(),
    getOrders(),
  ]);

  const finalizadas = ordenes.filter((o: any) => o.estado === "finalizado");
  const hoy = new Date().toISOString().split("T")[0];
  const recibidasHoy = ordenes.filter((o: any) =>
    o.fecha_ingreso?.startsWith(hoy)
  );

  const ahora = new Date();
  const equiposAbandonados = ordenes.filter((o: any) => {
    if (o.estado === "entregado") return false;
    const ingreso = new Date(o.fecha_ingreso);
    const dias = Math.floor(
      (ahora.getTime() - ingreso.getTime()) / (1000 * 60 * 60 * 24)
    );
    return dias >= 90;
  });

  const fechaHoy = format(new Date(), "EEEE d 'de' MMMM, yyyy", {
    locale: es,
  });

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1 capitalize">{fechaHoy}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <Link
            href="/ordenes/nueva"
            className="bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva Orden
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-2">En reparación</div>
          <div className="text-3xl font-bold text-brand-teal">{stats.totalActivas}</div>
          <div className="text-xs text-gray-500 mt-1">Activas en taller</div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-2">Finalizadas</div>
          <div className="text-3xl font-bold text-green-400">{stats.finalizadasParaRetirar}</div>
          <div className="text-xs text-gray-500 mt-1">Para entregar</div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-2">Ingresadas hoy</div>
          <div className="text-3xl font-bold text-blue-400">{stats.ingresadasHoy}</div>
          <div className="text-xs text-gray-500 mt-1">Recibidas</div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-medium mb-2">Alerta +90 días</div>
          <div className="text-3xl font-bold text-brand-red">{equiposAbandonados.length}</div>
          <div className="text-xs text-brand-red/60 mt-1">Equipos abandonados</div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Finalizadas - Para entregar */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl">
          <div className="px-5 py-4 border-b border-surface-600 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Finalizadas - Para entregar</h2>
            <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full font-medium">
              {finalizadas.length} equipo{finalizadas.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-surface-700">
            {finalizadas.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No hay equipos finalizados para entregar
              </div>
            ) : (
              finalizadas.slice(0, 5).map((orden: any) => (
                <Link
                  key={orden.id}
                  href={`/ordenes/${orden.id}`}
                  className="px-5 py-3 card-hover cursor-pointer flex items-center justify-between block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">#{orden.numero}</span>
                      <span className="text-sm font-medium">{orden.dispositivo}</span>
                      {orden.presupuesto && (
                        <span className="text-sm text-brand-teal font-semibold ml-auto mr-2">
                          ${orden.presupuesto.toLocaleString("es-AR")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {orden.cliente?.nombre}
                    </div>
                  </div>
                  <DashboardEntregarBtn ordenId={orden.id} />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recibidas hoy */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl">
          <div className="px-5 py-4 border-b border-surface-600 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Recibidas hoy</h2>
            <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full font-medium">
              {recibidasHoy.length} nueva{recibidasHoy.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="divide-y divide-surface-700">
            {recibidasHoy.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-500">
                No hay órdenes ingresadas hoy
              </div>
            ) : (
              recibidasHoy.slice(0, 5).map((orden: any) => (
                <Link
                  key={orden.id}
                  href={`/ordenes/${orden.id}`}
                  className="px-5 py-3 card-hover cursor-pointer block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 font-mono">#{orden.numero}</span>
                      <span className="text-sm font-medium ml-2">{orden.dispositivo}</span>
                    </div>
                    <EstadoBadge estado={orden.estado} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {orden.problema} - {orden.cliente?.nombre}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Equipment alert */}
          {equiposAbandonados.length > 0 && (
            <div className="px-5 py-4 border-t border-surface-600">
              <div className="bg-brand-red/10 border border-brand-red/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-brand-red" />
                  <span className="text-xs font-semibold text-brand-red">
                    Equipos +90 días
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {equiposAbandonados.slice(0, 3).map((o: any) => {
                    const dias = Math.floor(
                      (ahora.getTime() - new Date(o.fecha_ingreso).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={o.id}>
                        #{o.numero} - {o.dispositivo} - {o.cliente?.nombre || "Sin datos"} ({dias} días)
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
