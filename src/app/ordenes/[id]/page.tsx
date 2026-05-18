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
import { buildWhatsAppUrl } from "@/lib/constants";

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

  // Calculate warranty expiry
  let warrantyAlert = false;
  let warrantyDaysLeft = 0;
  if (orden.estado === "entregado" && orden.garantia && orden.fecha_entregado) {
    const match = orden.garantia.match(/(\d+)\s*días/i);
    if (match) {
      const warrantyDays = parseInt(match[1]);
      const deliveredDate = new Date(orden.fecha_entregado);
      const daysSinceDelivery = Math.floor((new Date().getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24));
      warrantyDaysLeft = warrantyDays - daysSinceDelivery;
      warrantyAlert = warrantyDaysLeft <= 10 && warrantyDaysLeft > 0;
    }
  }

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
                <p className="text-lg font-bold text-green-400 mt-0.5">
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
                    <span className="text-green-400 font-medium">
                      ${Number(pago.monto).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
                {resta !== null && resta > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Saldo</span>
                    <span className="font-semibold text-red-400">
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
                    <span className="font-semibold text-red-400">
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

      {/* Warranty expiry alert */}
      {warrantyAlert && cliente?.telefono && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-yellow-400">&#9200; Garantía por vencer</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Quedan {warrantyDaysLeft} días de garantía para esta reparación
            </p>
          </div>
          <a
            href={buildWhatsAppUrl(
              cliente.telefono,
              `Hola ${cliente.nombre}! Te escribimos de Electrónica El Garage. Te queríamos avisar que la garantía de tu ${orden.dispositivo} vence en ${warrantyDaysLeft} días. Si tenés algún inconveniente con el equipo, acercate por Alem 43, Villa Carlos Paz. Saludos!`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2 shrink-0"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.625-1.474A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.588-5.932-1.614l-.424-.254-2.744.876.878-2.686-.278-.44A9.772 9.772 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818 5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/></svg>
            Avisar por WhatsApp
          </a>
        </div>
      )}

      {/* Action buttons */}
      <OrderBottomActions ordenId={id} />
    </div>
  );
}
