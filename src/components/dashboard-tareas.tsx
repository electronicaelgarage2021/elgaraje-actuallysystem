"use client";

import { useState, useRef } from "react";
import { GripVertical, X, Plus } from "lucide-react";
import {
  createTarea,
  toggleTarea,
  deleteTarea,
  updateTareaTexto,
  reorderTareas,
} from "@/lib/actions/tareas";

interface Tarea {
  id: string;
  texto: string;
  completada: boolean;
  posicion: number;
}

export function DashboardTareas({ initialTareas }: { initialTareas: Tarea[] }) {
  const [tareas, setTareas] = useState<Tarea[]>(initialTareas);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const completadas = tareas.filter((t) => t.completada).length;

  async function handleAdd() {
    const texto = newText.trim();
    if (!texto) return;

    // Optimistic
    const tempId = `temp-${Date.now()}`;
    const nextPos = tareas.length > 0 ? Math.max(...tareas.map((t) => t.posicion)) + 1 : 0;
    setTareas((prev) => [...prev, { id: tempId, texto, completada: false, posicion: nextPos }]);
    setNewText("");
    inputRef.current?.focus();

    await createTarea(texto);
  }

  async function handleToggle(id: string, completada: boolean) {
    // Optimistic
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada } : t))
    );
    await toggleTarea(id, completada);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    // Optimistic
    setTareas((prev) => prev.filter((t) => t.id !== id));
    await deleteTarea(id);
  }

  function startEdit(tarea: Tarea) {
    setEditingId(tarea.id);
    setEditText(tarea.texto);
  }

  async function saveEdit() {
    if (!editingId) return;
    const texto = editText.trim();
    if (!texto) {
      setEditingId(null);
      return;
    }
    // Optimistic
    setTareas((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, texto } : t))
    );
    setEditingId(null);
    await updateTareaTexto(editingId, texto);
  }

  // Drag & drop handlers
  function handleDragStart(id: string) {
    setDraggedId(id);
    dragRef.current = id;
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  async function handleDrop(targetId: string) {
    const sourceId = dragRef.current;
    setDraggedId(null);
    setDragOverId(null);
    dragRef.current = null;

    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = tareas.findIndex((t) => t.id === sourceId);
    const targetIndex = tareas.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder
    const newTareas = [...tareas];
    const [moved] = newTareas.splice(sourceIndex, 1);
    newTareas.splice(targetIndex, 0, moved);

    // Update positions
    const reordered = newTareas.map((t, i) => ({ ...t, posicion: i }));
    setTareas(reordered);

    await reorderTareas(reordered.map((t) => t.id));
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-surface-600 flex items-center justify-between">
        <h2 className="font-semibold text-sm">Tareas del día</h2>
        <span className="text-xs bg-brand-teal/10 text-brand-teal px-2 py-1 rounded-full font-medium">
          {completadas}/{tareas.length}
        </span>
      </div>

      {/* Add input */}
      <div className="px-5 py-3 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="Agregar tarea..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
          />
        </div>
      </div>

      {/* Task list */}
      <div className="divide-y divide-surface-700">
        {tareas.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">
            No hay tareas para hoy
          </div>
        ) : (
          tareas.map((tarea) => {
            const isDragging = draggedId === tarea.id;
            const isDragOver = dragOverId === tarea.id;

            return (
              <div
                key={tarea.id}
                draggable
                onDragStart={() => handleDragStart(tarea.id)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                onDragOver={(e) => handleDragOver(e, tarea.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(tarea.id)}
                className={`px-5 py-2.5 flex items-center gap-3 transition-all ${
                  isDragging ? "opacity-40" : ""
                } ${isDragOver ? "bg-brand-teal/5 border-l-2 border-l-brand-teal" : ""}`}
              >
                {/* Drag handle */}
                <GripVertical className="w-4 h-4 text-gray-600 shrink-0 cursor-grab active:cursor-grabbing" />

                {/* Checkbox */}
                <label className="shrink-0 flex items-center">
                  <input
                    type="checkbox"
                    checked={tarea.completada}
                    onChange={(e) => handleToggle(tarea.id, e.target.checked)}
                    className="w-4 h-4 rounded border-surface-500 bg-surface-700 text-brand-teal focus:ring-brand-teal/30 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                {/* Text / Edit */}
                {editingId === tarea.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={saveEdit}
                    className="flex-1 bg-surface-700 border border-surface-500 rounded px-2 py-1 text-sm text-white outline-none focus:border-brand-teal"
                  />
                ) : (
                  <span
                    onClick={() => startEdit(tarea)}
                    className={`flex-1 text-sm cursor-pointer transition-colors ${
                      tarea.completada
                        ? "line-through text-gray-600"
                        : "text-gray-200 hover:text-white"
                    }`}
                  >
                    {tarea.texto}
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(tarea.id)}
                  className="shrink-0 p-1 rounded text-gray-600 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                  title="Eliminar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
