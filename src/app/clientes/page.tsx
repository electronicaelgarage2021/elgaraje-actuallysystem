export const dynamic = "force-dynamic";

import { getClients } from "@/lib/actions/clients";
import Link from "next/link";
import { ClientsSearch } from "./clients-search";
import { AddClientButton, EditClientButton, DeleteClientButton } from "./clients-actions";

const AVATAR_COLORS = [
  "bg-brand-teal/15 text-brand-teal",
  "bg-purple-500/15 text-purple-400",
  "bg-orange-500/15 text-orange-400",
  "bg-blue-500/15 text-blue-400",
  "bg-pink-500/15 text-pink-400",
  "bg-yellow-500/15 text-yellow-400",
];

function getInitials(nombre: string) {
  const parts = nombre.split(/[\s,]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nombre.slice(0, 2).toUpperCase();
}

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const clientes = await getClients(params.q);

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientsSearch currentQuery={params.q} />
          <AddClientButton />
        </div>
      </div>

      {clientes.length === 0 ? (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-12 text-center">
          <p className="text-gray-500">No se encontraron clientes</p>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
          <div className="divide-y divide-surface-700">
            {clientes.map((cliente: any, index: number) => (
              <div
                key={cliente.id}
                className="px-5 py-4 card-hover flex items-center justify-between"
              >
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(index)}`}>
                    {getInitials(cliente.nombre)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{cliente.nombre}</div>
                    <div className="text-xs text-gray-500">
                      {cliente.dni ? `DNI: ${cliente.dni}` : ""}
                      {cliente.dni && cliente.telefono ? " · " : ""}
                      {cliente.telefono || ""}
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <EditClientButton client={cliente} />
                  <DeleteClientButton clientId={cliente.id} clientName={cliente.nombre} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
