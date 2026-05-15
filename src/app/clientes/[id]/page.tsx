export const dynamic = "force-dynamic";

import { getClient, getClientOrders } from "@/lib/actions/clients";
import { EstadoBadge } from "@/components/estado-badge";
import { Phone, IdCard, Mail, FileText, ChevronLeft, User, Wrench } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientDetailActions } from "./client-detail-actions";

export default async function ClienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cliente: any, ordenes: any;
  try {
    [cliente, ordenes] = await Promise.all([
      getClient(id),
      getClientOrders(id),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto fade-in">
      <Link
        href="/clientes"
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">{cliente.nombre}</h1>
        <ClientDetailActions client={cliente} />
      </div>

      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-teal" />
          Información de contacto
        </h2>
        <div className="space-y-2 text-sm">
          {cliente.telefono && (
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </span>
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
          {cliente.dni && (
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <IdCard className="w-3.5 h-3.5" /> DNI
              </span>
              <span>{cliente.dni}</span>
            </div>
          )}
          {cliente.email && (
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Email
              </span>
              <span>{cliente.email}</span>
            </div>
          )}
          {cliente.notas && (
            <div className="flex justify-between">
              <span className="text-gray-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Notas
              </span>
              <span className="text-gray-300">{cliente.notas}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-surface-700">
            <span className="text-gray-400">Cliente desde</span>
            <span className="text-gray-300">
              {format(new Date(cliente.created_at), "dd/MM/yyyy", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-brand-teal" />
          Reparaciones ({ordenes.length})
        </h2>
        {ordenes.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            Sin reparaciones registradas
          </p>
        ) : (
          <div className="divide-y divide-surface-700">
            {ordenes.map((orden: any) => (
              <Link
                key={orden.id}
                href={`/ordenes/${orden.id}`}
                className="flex items-center justify-between py-3 card-hover rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 font-mono">
                    #{orden.numero}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{orden.dispositivo}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(orden.fecha_ingreso), "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                <EstadoBadge estado={orden.estado} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
