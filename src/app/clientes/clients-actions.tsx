"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "@/lib/actions/clients";
import { ClientFormModal } from "@/components/client-form-modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Cliente } from "@/lib/types";

export function AddClientButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-brand-teal hover:bg-brand-teal-dark text-surface-900 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Nuevo Cliente
      </button>
      <ClientFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function EditClientButton({ client }: { client: Cliente }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-600 transition-colors"
        title="Editar"
      >
        <Pencil className="w-4 h-4" />
      </button>
      {open && (
        <ClientFormModal open={open} onClose={() => setOpen(false)} client={client} />
      )}
    </>
  );
}

export function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`¿Eliminar a ${clientName}? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    await deleteClient(clientId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg text-gray-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors disabled:opacity-50"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
