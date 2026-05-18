import {
  getOrder,
  getOrderHistory,
  getOrderPayments,
} from "@/lib/actions/orders";
import { getClientOrders } from "@/lib/actions/clients";
import { OrderTimeline } from "@/components/order-timeline";
import { OrderDetailActions } from "./order-detail-actions";
import { OrderBottomActions } from "./order-bottom-actions";
import { PaymentHistory } from "@/components/payment-history";
import { OrderWarranty } from "./order-warranty";
import { DiscountSuggestion } from "@/components/discount-suggestion";
import { EstadoBadge } from "@/components/estado-badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User, Smartphone, Wrench, Calendar, DollarSign } from "lucide-react";

export default async function OrdenDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let orden: any, historial: any, pagos: any, clienteOrdenes: any[];
  try {
    [orden, historial, pagos] = await Promise.all([
      getOrder(id),
      getOrderHistory(id),
      getOrderPayments(id),
    ]);
    clienteOrdenes = orden.cliente_id ? await getClientOrders(orden.cliente_id) : [];
  } catch {
    notFound();
  }

  const cliente = orden.cliente;
  const totalPagado = pagos.reduce(
    (sum: number, p: any) => sum + Number(p.monto),
    0
  );
  const resta = orden.presupuesto ? orden.presupuesto - totalPagado : null;
  const diasEnTaller = Math.floor(
    (new Date().getTime() - new Date(orden.fecha_ingreso).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <Link
        href="/ordenes"
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a reparaciones
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Orden #{orden.numero}</h1>
            <EstadoBadge estado={orden.estado} />
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Ingreso: {format(new Date(orden.fecha_ingreso), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
          </p>
        </div>
      </div>

      {/* Discount suggestion */}
      <DiscountSuggestion
        clientName={cliente?.nombre || ""}
        orderCount={clienteOrdenes.length}
        presupuesto={orden.presupuesto}
      />

      {/* Timeline */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Estado de la reparación</h2>
        </div>
        <OrderTimeline estadoActual={orden.estado} historial={historial} />
        <div className="mt-5">
          <OrderDetailActions orden={orden} totalPagado={totalPagado} />
        </div>
      </div>

      {/* Client + Equipment */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-teal" />
            Cliente
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nombre</span>
              <span className="font-medium">{cliente?.nombre}</span>
            </div>
            {cliente?.dni && (
              <div className="flex justify-between">
                <span className="text-gray-400">DNI</span>
                <span>{cliente.dni}</span>
              </div>
            )}
            {cliente?.telefono && (
              <div className="flex justify-between">
                <span className="text-gray-400">WhatsApp</span>
                <a
                  href={`https://wa.me/54${cliente.telefono.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-teal hover:underline"
                >
                  {cliente.telefono}
                </a>
              </div>
            )}
          </div>
        </div>
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-teal" />
            Equipo
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Dispositivo</span>
              <span className="font-medium">{orden.dispositivo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repair detail */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-brand-teal" />
          Detalle de la reparación
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Problema reportado</span>
            <p className="mt-0.5">{orden.problema}</p>
          </div>
          {orden.observaciones && (
            <div>
              <span className="text-gray-400 text-xs">Observaciones</span>
              <p className="mt-0.5">{orden.observaciones}</p>
            </div>
          )}
          {orden.presupuesto && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-surface-700">
              <div>
                <span className="text-gray-400 text-xs">Presupuesto</span>
                <p className="text-lg font-bold text-brand-teal mt-0.5">
                  ${orden.presupuesto.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dates + Payments */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-teal" />
            Fechas
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Ingreso</span>
              <span>{format(new Date(orden.fecha_ingreso), "dd/MM/yyyy - HH:mm", { locale: es })}</span>
            </div>
            {orden.fecha_entrega_estimada && (
              <div className="flex justify-between">
                <span className="text-gray-400">Estimada</span>
                <span>{format(new Date(orden.fecha_entrega_estimada + "T12:00:00"), "dd/MM/yyyy", { locale: es })}</span>
              </div>
            )}
            {orden.fecha_entregado && (
              <div className="flex justify-between">
                <span className="text-gray-400">Entregado</span>
                <span className="text-green-400">{format(new Date(orden.fecha_entregado), "dd/MM/yyyy", { locale: es })}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Días en taller</span>
              <span>{diasEnTaller} días</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-teal" />
            Pago
          </h2>
          <div className="space-y-2 text-sm">
            {orden.presupuesto && (
              <div className="flex justify-between">
                <span className="text-gray-400">Presupuesto</span>
                <span className="font-medium">${orden.presupuesto.toLocaleString("es-AR")}</span>
              </div>
            )}
            {pagos.length > 0 ? (
              <>
                {pagos.map((pago: any) => (
                  <div key={pago.id} className="flex justify-between">
                    <span className="text-gray-400">
                      {pago.tipo === "sena" ? "Seña" : "Pago"} ({pago.metodo})
                    </span>
                    <span className="text-brand-teal font-medium">
                      ${Number(pago.monto).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
                {resta !== null && resta > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo</span>
                    <span className="font-semibold text-brand-teal">
                      ${resta.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className={`status-badge ${resta && resta > 0 ? "bg-yellow-500/15 text-yellow-400" : "bg-green-500/15 text-green-400"}`}>
                    {resta && resta > 0 ? "Pendiente" : "Pagado"}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-400">Seña</span>
                  <span className="text-gray-500">No dejó seña</span>
                </div>
                {orden.presupuesto && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo</span>
                    <span className="font-semibold text-brand-teal">
                      ${orden.presupuesto.toLocaleString("es-AR")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className="status-badge bg-yellow-500/15 text-yellow-400">Pendiente</span>
                </div>
              </>
            )}
            <PaymentHistory pagos={pagos} ordenId={id} />
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 mb-6">
        <OrderWarranty ordenId={id} currentWarranty={orden.garantia} />
      </div>

      {/* Action buttons */}
      <OrderBottomActions ordenId={id} />
    </div>
  );
}
