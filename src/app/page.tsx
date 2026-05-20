export const dynamic = "force-dynamic";

import { getDashboardStats, getOrders, getMonthlyStats } from "@/lib/actions/orders";
import { getTareas } from "@/lib/actions/tareas";
import { EstadoBadge } from "@/components/estado-badge";
import { DashboardTareas } from "@/components/dashboard-tareas";
import { Check, PlusCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DashboardEntregarBtn } from "@/components/dashboard-entregar-btn";
import { DashboardReparacionBtn } from "@/components/dashboard-reparacion-btn";
import { ExportButton } from "@/components/export-button";
import { DashboardMonthly } from "@/components/dashboard-monthly";
import { buildWhatsAppUrl } from "@/lib/constants";

export default async function Dashboard() {
  const [stats, ordenes, tareas, monthlyStats] = await Promise.all([
    getDashboardStats(),
    getOrders(),
    getTareas(),
    getMonthlyStats(),
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

  // Warranty expiry alerts (within 10 days)
  const garantiasPorVencer = ordenes
    .filter((o: any) => {
      if (o.estado !== "entregado" || !o.garantia || !o.fecha_entregado) return false;
      const match = o.garantia.match(/(\d+)\s*días/i);
      if (!match) return false;
      const warrantyDays = parseInt(match[1]);
      const daysSinceDelivery = Math.floor(
        (ahora.getTime() - new Date(o.fecha_entregado).getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysLeft = warrantyDays - daysSinceDelivery;
      return daysLeft <= 10 && daysLeft > 0;
    })
    .map((o: any) => {
      const match = o.garantia.match(/(\d+)\s*días/i)!;
      const warrantyDays = parseInt(match[1]);
      const daysSinceDelivery = Math.floor(
        (ahora.getTime() - new Date(o.fecha_entregado).getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...o, daysLeft: warrantyDays - daysSinceDelivery };
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

      {/* Tareas del día */}
      <div className="mb-6">
        <DashboardTareas initialTareas={tareas} />
      </div>

      {/* Monthly business health */}
      <div className="mb-6">
        <DashboardMonthly stats={monthlyStats} />
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
                        <span className="text-sm text-green-400 font-semibold ml-auto mr-2">
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
                  className="px-5 py-3 card-hover cursor-pointer flex items-center justify-between block"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono">#{orden.numero}</span>
                      <span className="text-sm font-medium">{orden.dispositivo}</span>
                      <EstadoBadge estado={orden.estado} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {orden.problema} - {orden.cliente?.nombre}
                    </div>
                  </div>
                  {orden.estado === "recibido" && (
                    <DashboardReparacionBtn ordenId={orden.id} />
                  )}
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

      {/* Warranty expiry alerts */}
      {garantiasPorVencer.length > 0 && (
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-yellow-400">
              Garantías por vencer ({garantiasPorVencer.length})
            </h2>
          </div>
          <div className="space-y-3">
            {garantiasPorVencer.slice(0, 5).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between">
                <Link href={`/ordenes/${o.id}`} className="flex-1 min-w-0 hover:underline">
                  <div className="text-sm">
                    <span className="text-gray-500 font-mono">#{o.numero}</span>
                    <span className="ml-2 font-medium">{o.dispositivo}</span>
                    <span className="ml-2 text-gray-400">- {o.cliente?.nombre || "Sin datos"}</span>
                  </div>
                  <div className="text-xs text-yellow-400/80 mt-0.5">
                    {o.daysLeft} días restantes de garantía
                  </div>
                </Link>
                {o.cliente?.telefono && (
                  <a
                    href={buildWhatsAppUrl(
                      o.cliente.telefono,
                      `Hola ${o.cliente.nombre}! Te escribimos de Electrónica El Garage. Te queríamos avisar que la garantía de tu ${o.dispositivo} vence en ${o.daysLeft} días. Si tenés algún inconveniente con el equipo, acercate por Alem 43, Villa Carlos Paz. Saludos!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-1.5 shrink-0 ml-3"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.474A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.588-5.932-1.614l-.424-.254-2.744.876.878-2.686-.278-.44A9.772 9.772 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818 5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/></svg>
                    WhatsApp
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
