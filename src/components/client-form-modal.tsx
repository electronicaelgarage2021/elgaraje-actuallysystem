"use client";

import { useState } from "react";
import { createClient, updateClient } from "@/lib/actions/clients";
import { X } from "lucide-react";
import type { Cliente } from "@/lib/types";

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  client?: Cliente | null;
}

export function ClientFormModal({ open, onClose, client }: ClientFormModalProps) {
  const isEdit = !!client;
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState(client?.nombre || "");
  const [telefono, setTelefono] = useState(client?.telefono || "");
  const [dni, setDni] = useState(client?.dni || "");
  const [email, setEmail] = useState(client?.email || "");
  const [notas, setNotas] = useState(client?.notas || "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("nombre", nombre);
    fd.set("telefono", telefono);
    fd.set("dni", dni);
    fd.set("email", email);
    fd.set("notas", notas);

    if (isEdit) {
      await updateClient(client.id, fd);
    } else {
      await createClient(fd);
    }
    setLoading(false);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay">
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        <div className="p-5 border-b border-surface-600 flex items-center justify-between">
          <h2 className="font-semibold">{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Nombre *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Teléfono</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="351 1234567"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">DNI</label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="12345678"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Notas sobre el cliente..."
              rows={2}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nombre || loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal hover:bg-brand-teal-dark text-surface-900 transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : isEdit ? "Guardar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
