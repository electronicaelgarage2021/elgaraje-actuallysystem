"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { RepuestoSearchInput } from "./repuesto-search-input";

interface Props {
  name: string; // Hidden field name that will carry the JSON array
}

export function RepuestosListInput({ name }: Props) {
  // Each entry has a stable id (for keys) and the current value
  const [entries, setEntries] = useState<{ id: number; value: string }[]>([
    { id: 0, value: "" },
  ]);
  const [nextId, setNextId] = useState(1);

  function updateEntry(id: number, value: string) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, value } : e)));
  }

  function addEntry() {
    setEntries((prev) => [...prev, { id: nextId, value: "" }]);
    setNextId((n) => n + 1);
  }

  function removeEntry(id: number) {
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.length === 0 ? [{ id: nextId, value: "" }] : filtered;
    });
    if (entries.length === 1) setNextId((n) => n + 1);
  }

  const jsonValue = JSON.stringify(
    entries.map((e) => e.value.trim()).filter((v) => v.length > 0)
  );

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={jsonValue} />
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-2 items-start">
          <div className="flex-1">
            <RepuestoSearchInput
              name={`__repuesto_${entry.id}`}
              defaultValue={entry.value}
              placeholder={
                idx === 0
                  ? "Buscar en lista de precios o escribir libre..."
                  : "Otro repuesto..."
              }
              onChange={(v) => updateEntry(entry.id, v)}
            />
          </div>
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => removeEntry(entry.id)}
              className="p-2.5 rounded-lg bg-surface-700 hover:bg-surface-600 text-gray-500 hover:text-brand-red transition-colors shrink-0"
              title="Eliminar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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
