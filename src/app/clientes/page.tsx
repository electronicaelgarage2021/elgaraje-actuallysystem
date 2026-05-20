export const dynamic = "force-dynamic";

import { getClients } from "@/lib/actions/clients";
import { AddClientButton } from "./clients-actions";
import { ClientsList } from "./clients-search";

export default async function ClientesPage() {
  const clientes = await getClients();

  return (
    <div className="fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <AddClientButton />
      </div>
      <ClientsList clientes={clientes as any} />
    </div>
  );
}
