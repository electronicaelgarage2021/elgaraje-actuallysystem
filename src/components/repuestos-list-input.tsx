"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

const CATEGORIAS_REPUESTO = [
  "Modulo",
  "Bateria",
  "Marco",
  "Placa de carga",
  "Flex Main",
  "Flex Power/Vol",
  "Partes chicas",
  "Huella",
  "Parlante",
  "Camara/Vidrio",
  "Glass/Tapa",
  "Accesorios",
  "Herramientas",
];

interface Entry {
  id: number;
  descripcion: string;
  categorias: string[];
}

interface Props {
  name: string;
}

export function RepuestosListInput({ name }: Props) {
  const [entries, setEntries] = useState<Entry[]>([
    { id: 0, descripcion: "", categorias: [] },
  ]);
  const [nextId, setNextId] = useState(1);

  function updateDescripcion(id: number, descripcion: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, descripcion } : e)));
  }

  function toggleCategoria(id: number, cat: string) {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              categorias: e.categorias.includes(cat)
                ? e.categorias.filter((c) => c !== cat)
                : [...e.categorias, cat],
            }
          : e
      )
    );
  }

  function addEntry() {
    setEntries((prev) => [...prev, { id: nextId, descripcion: "", categorias: [] }]);
    setNextId((n) => n + 1);
  }

  function removeEntry(id: number) {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.length === 0
        ? [{ id: nextId, descripcion: "", categorias: [] }]
        : filtered;
    });
    if (entries.length === 1) setNextId((n) => n + 1);
  }

  // Build JSON: "Descripcion — Cat1, Cat2"
  const jsonValue = JSON.stringify(
    entries
      .filter((e) => e.descripcion.trim() && e.categorias.length > 0)
      .map((e) => `${e.descripcion.trim()} — ${e.categorias.join(", ")}`)
  );

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={jsonValue} />
      {entries.map((entry, idx) => (
        <div
          key={entry.id}
          className="bg-surface-700/50 border border-surface-600 rounded-lg p-3 space-y-2"
        >
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <input
                type="text"
                value={entry.descripcion}
                onChange={(e) => updateDescripcion(entry.id, e.target.value)}
                placeholder={idx === 0 ? "Ej: Samsung A54, Moto G5" : "Otro dispositivo..."}
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm placeholder-gray-500"
              />
            </div>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="p-2 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-500 hover:text-brand-red transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS_REPUESTO.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategoria(entry.id, cat)}
                className={`px-2 py-0.5 rounded-full text-[0.6rem] font-medium transition-colors ${
                  entry.categorias.includes(cat)
                    ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                    : "bg-surface-700 text-gray-500 hover:bg-surface-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="text-xs text-brand-teal hover:underline flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        Agregar otro repuesto
      </button>
    </div>
  );
}
