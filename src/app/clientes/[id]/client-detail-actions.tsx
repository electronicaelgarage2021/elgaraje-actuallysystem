"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/lib/actions/clients";
import { ClientFormModal } from "@/components/client-form-modal";
import { Pencil, Trash2 } from "lucide-react";
import type { Cliente } from "@/lib/types";

export function ClientDetailActions({ client }: { client: Cliente }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${client.nombre}? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    await deleteClient(client.id);
    router.push("/clientes");
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="bg-surface-700 hover:bg-surface-600 text-gray-300 font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-medium px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
      <ClientFormModal open={editOpen} onClose={() => setEditOpen(false)} client={client} />
    </>
  );
}
