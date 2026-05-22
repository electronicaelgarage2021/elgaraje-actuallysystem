"use client";

import { useState, useRef } from "react";
import { updateOrderEstado, cancelOrder } from "@/lib/actions/orders";
import { buildWhatsAppUrl, buildMensajeEntrega, isSinReparacion } from "@/lib/constants";
import type { EstadoOrden } from "@/lib/types";
import { Eye, DollarSign, MessageCircle, GripVertical, X } from "lucide-react";
import Link from "next/link";

interface KanbanOrden {
  id: string;
  numero: number;
  dispositivo: string;
  problema: string;
  estado: EstadoOrden;
  presupuesto: number | null;
  observaciones: string | null;
  prioridad: boolean;
  fecha_ingreso: string;
  cliente: {
    id: string;
    nombre: string;
    telefono: string | null;
  } | null;
}

interface KanbanColumna {
  estado: EstadoOrden;
  label: string;
  color: string;
  ordenes: KanbanOrden[];
}

const COLOR_MAP: Record<string, { bg: string; border: string; dot: string; text: string; headerBg: string }> = {
  blue: { bg: "bg-blue-500/5", border: "border-blue-500/20", dot: "bg-blue-400", text: "text-blue-400", headerBg: "bg-blue-500/10" },
  purple: { bg: "bg-purple-500/5", border: "border-purple-500/20", dot: "bg-purple-400", text: "text-purple-400", headerBg: "bg-purple-500/10" },
  yellow: { bg: "bg-yellow-500/5", border: "border-yellow-500/20", dot: "bg-yellow-400", text: "text-yellow-400", headerBg: "bg-yellow-500/10" },
  green: { bg: "bg-green-500/5", border: "border-green-500/20", dot: "bg-green-400", text: "text-green-400", headerBg: "bg-green-500/10" },
  gray: { bg: "bg-gray-500/5", border: "border-gray-500/20", dot: "bg-gray-400", text: "text-gray-400", headerBg: "bg-gray-500/10" },
};

export function KanbanBoard({ initialColumnas }: { initialColumnas: KanbanColumna[] }) {
  const [columnas, setColumnas] = useState(initialColumnas);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<EstadoOrden | null>(null);
  const dragRef = useRef<string | null>(null);

  function handleDragStart(ordenId: string) {
    setDraggedId(ordenId);
    dragRef.current = ordenId;
  }

  function handleDragOver(e: React.DragEvent, estado: EstadoOrden) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(estado);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(targetEstado: EstadoOrden) {
    const ordenId = dragRef.current;
    setDraggedId(null);
    setDragOverCol(null);
    dragRef.current = null;

    if (!ordenId) return;

    let movedOrden: KanbanOrden | null = null;
    let sourceEstado: EstadoOrden | null = null;

    for (const col of columnas) {
      const found = col.ordenes.find((o) => o.id === ordenId);
      if (found) {
        movedOrden = found;
        sourceEstado = col.estado;
        break;
      }
    }

    if (!movedOrden || sourceEstado === targetEstado) return;

    setColumnas((prev) =>
      prev.map((col) => {
        if (col.estado === sourceEstado) {
          return { ...col, ordenes: col.ordenes.filter((o) => o.id !== ordenId) };
        }
        if (col.estado === targetEstado) {
          return { ...col, ordenes: [...col.ordenes, { ...movedOrden!, estado: targetEstado }] };
        }
        return col;
      })
    );

    await updateOrderEstado(ordenId, targetEstado);
  }

  function getDiasEnTaller(fechaIngreso: string) {
    return Math.floor(
      (Date.now() - new Date(fechaIngreso).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  async function handleDelete(e: React.MouseEvent, ordenId: string, dispositivo: string) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`¿Eliminar la orden de ${dispositivo}? Esta acción no se puede deshacer.`)) return;
    // Optimistic remove
    setColumnas((prev) =>
      prev.map((col) => ({ ...col, ordenes: col.ordenes.filter((o) => o.id !== ordenId) }))
    );
    try {
      await cancelOrder(ordenId);
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la orden");
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8">
      {columnas.map((col) => {
        const colors = COLOR_MAP[col.color];
        const isOver = dragOverCol === col.estado;

        return (
          <div
            key={col.estado}
            onDragOver={(e) => handleDragOver(e, col.estado)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(col.estado)}
            className={`flex-shrink-0 w-64 rounded-xl border transition-all ${colors.bg} ${
              isOver ? "border-brand-teal ring-1 ring-brand-teal/30" : colors.border
            }`}
          >
            <div className={`px-3 py-2.5 rounded-t-xl ${colors.headerBg} border-b ${colors.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className={`text-xs font-semibold ${colors.text}`}>{col.label}</span>
                </div>
                <span className="text-[0.65rem] text-gray-500 font-medium bg-surface-800/50 px-1.5 py-0.5 rounded">
                  {col.ordenes.length}
                </span>
              </div>
            </div>

            <div className="p-2 space-y-2 min-h-[120px]">
              {[...col.ordenes].sort((a, b) => (b.prioridad ? 1 : 0) - (a.prioridad ? 1 : 0)).map((orden) => {
                const dias = getDiasEnTaller(orden.fecha_ingreso);
                const isDragging = draggedId === orden.id;

                return (
                  <div
                    key={orden.id}
                    draggable
                    onDragStart={() => handleDragStart(orden.id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverCol(null); }}
                    className={`bg-surface-800 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-surface-500 ${
                      isDragging ? "opacity-40 scale-95" : ""
                    } ${orden.prioridad ? "border-brand-red/50 ring-1 ring-brand-red/20" : "border-surface-600"}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        <span className="text-[0.65rem] text-gray-500 font-mono">#{orden.numero}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSinReparacion(orden.observaciones) && (
                          <span className="text-[0.6rem] bg-yellow-500/15 text-yellow-400 px-1.5 py-0.5 rounded font-medium">
                            Sin rep.
                          </span>
                        )}
                        {orden.prioridad && (
                          <span className="text-[0.6rem] bg-brand-red/15 text-brand-red px-1.5 py-0.5 rounded font-medium">
                            ⚡
                          </span>
                        )}
                        {dias > 90 && (
                          <span className="text-[0.6rem] bg-brand-red/15 text-brand-red px-1.5 py-0.5 rounded font-medium">
                            {dias}d
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, orden.id, orden.dispositivo)}
                          className="p-0.5 rounded text-gray-600 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                          title="Eliminar orden"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm font-medium truncate">{orden.dispositivo}</p>
                    <p className="text-xs text-gray-500 truncate">{orden.cliente?.nombre}</p>
                    <p className="text-[0.65rem] text-gray-600 truncate mt-0.5">{orden.problema}</p>

                    {orden.presupuesto && (
                      <p className="text-xs text-green-400 font-medium mt-1.5">
                        ${orden.presupuesto.toLocaleString("es-AR")}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-surface-700">
                      <Link
                        href={`/ordenes/${orden.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded text-gray-500 hover:text-white hover:bg-surface-700 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {orden.cliente?.telefono && (
                        <a
                          href={buildWhatsAppUrl(
                            orden.cliente.telefono,
                            buildMensajeEntrega(orden.cliente.nombre, orden.dispositivo)
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {orden.presupuesto && (
                        <Link
                          href={`/ordenes/${orden.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded text-gray-500 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
                          title="Cobrar"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <span className="ml-auto text-[0.6rem] text-gray-600">{dias}d</span>
                    </div>
                  </div>
                );
              })}

              {col.ordenes.length === 0 && (
                <div className="text-center py-6 text-gray-600 text-xs">
                  Sin órdenes
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
