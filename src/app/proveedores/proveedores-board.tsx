"use client";

import { useState, useRef, useEffect } from "react";
import {
  createRepuesto,
  assignRepuesto,
  assignAllRepuestos,
  markRepuestosPedidos,
  deleteRepuesto,
} from "@/lib/actions/repuestos";
import {
  GripVertical,
  X,
  Plus,
  MessageCircle,
  Phone,
  ArrowRightToLine,
} from "lucide-react";

interface Repuesto {
  id: string;
  nombre: string;
  proveedor: string | null;
  orden: { numero: number; dispositivo: string } | null;
}

interface ProveedoresBoardProps {
  initialSinAsignar: Repuesto[];
  initialCordoba: Repuesto[];
  initialVcp: Repuesto[];
}

function buildWaUrl(telefono: string, mensaje: string) {
  const tel = telefono.replace(/\D/g, "");
  const fullTel = tel.startsWith("54") ? tel : `54${tel}`;
  return `https://wa.me/${fullTel}?text=${encodeURIComponent(mensaje)}`;
}

export function ProveedoresBoard({
  initialSinAsignar,
  initialCordoba,
  initialVcp,
}: ProveedoresBoardProps) {
  const [sinAsignar, setSinAsignar] = useState(initialSinAsignar);
  const [cordoba, setCordoba] = useState(initialCordoba);
  const [vcp, setVcp] = useState(initialVcp);

  // Sync local state when server data changes (e.g. after router.refresh)
  useEffect(() => {
    setSinAsignar(initialSinAsignar);
  }, [initialSinAsignar]);
  useEffect(() => {
    setCordoba(initialCordoba);
  }, [initialCordoba]);
  useEffect(() => {
    setVcp(initialVcp);
  }, [initialVcp]);

  // Listen for optimistic adds from the price list (sibling component)
  useEffect(() => {
    function handleAdd(e: Event) {
      const ev = e as CustomEvent<Repuesto>;
      setSinAsignar((prev) => [...prev, ev.detail]);
    }
    function handleRemove(e: Event) {
      const ev = e as CustomEvent<{ id: string }>;
      setSinAsignar((prev) => prev.filter((r) => r.id !== ev.detail.id));
    }
    window.addEventListener("repuesto-optimistic-add", handleAdd);
    window.addEventListener("repuesto-optimistic-remove", handleRemove);
    return () => {
      window.removeEventListener("repuesto-optimistic-add", handleAdd);
      window.removeEventListener("repuesto-optimistic-remove", handleRemove);
    };
  }, []);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const dragRef = useRef<string | null>(null);

  const [nuevoRepuesto, setNuevoRepuesto] = useState("");
  const [adding, setAdding] = useState(false);

  const [telCordoba, setTelCordoba] = useState("");
  const [telVcp, setTelVcp] = useState("");

  // Load phone numbers from localStorage
  useEffect(() => {
    setTelCordoba(localStorage.getItem("proveedor_cordoba_tel") || "+54 9 3513 12-3039");
    setTelVcp(localStorage.getItem("proveedor_vcp_tel") || "+54 9 3541 37-8737");
  }, []);

  function saveTelCordoba(val: string) {
    setTelCordoba(val);
    localStorage.setItem("proveedor_cordoba_tel", val);
  }

  function saveTelVcp(val: string) {
    setTelVcp(val);
    localStorage.setItem("proveedor_vcp_tel", val);
  }

  function getAllLists(): Record<string, Repuesto[]> {
    return { sinAsignar, cordoba, vcp };
  }

  function findRepuesto(id: string): { repuesto: Repuesto; source: string } | null {
    const lists = getAllLists();
    for (const [key, list] of Object.entries(lists)) {
      const found = list.find((r) => r.id === id);
      if (found) return { repuesto: found, source: key };
    }
    return null;
  }

  function setListByKey(key: string, updater: (prev: Repuesto[]) => Repuesto[]) {
    if (key === "sinAsignar") setSinAsignar(updater);
    else if (key === "cordoba") setCordoba(updater);
    else if (key === "vcp") setVcp(updater);
  }

  function handleDragStart(id: string) {
    setDraggedId(id);
    dragRef.current = id;
  }

  function handleDragOver(e: React.DragEvent, col: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(targetCol: string) {
    const id = dragRef.current;
    setDraggedId(null);
    setDragOverCol(null);
    dragRef.current = null;

    if (!id) return;

    const found = findRepuesto(id);
    if (!found || found.source === targetCol) return;

    const { repuesto, source } = found;

    // Optimistic update
    setListByKey(source, (prev) => prev.filter((r) => r.id !== id));
    const proveedorValue = targetCol === "sinAsignar" ? null : targetCol;
    setListByKey(targetCol, (prev) => [
      ...prev,
      { ...repuesto, proveedor: proveedorValue },
    ]);

    await assignRepuesto(
      id,
      targetCol === "sinAsignar" ? null : (targetCol as "cordoba" | "vcp")
    );
  }

  async function handleAddRepuesto() {
    if (!nuevoRepuesto.trim() || adding) return;
    setAdding(true);
    try {
      await createRepuesto(nuevoRepuesto.trim());
      // Optimistic: add to sinAsignar with temp id (will be overwritten on revalidation)
      setSinAsignar((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          nombre: nuevoRepuesto.trim(),
          proveedor: null,
          orden: null,
        },
      ]);
      setNuevoRepuesto("");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    const found = findRepuesto(id);
    if (!found) return;
    setListByKey(found.source, (prev) => prev.filter((r) => r.id !== id));
    await deleteRepuesto(id);
  }

  async function handleAssignAll(proveedor: "cordoba" | "vcp") {
    if (sinAsignar.length === 0) return;
    const items = [...sinAsignar];
    setSinAsignar([]);
    if (proveedor === "cordoba") {
      setCordoba((prev) => [
        ...prev,
        ...items.map((r) => ({ ...r, proveedor: "cordoba" })),
      ]);
    } else {
      setVcp((prev) => [
        ...prev,
        ...items.map((r) => ({ ...r, proveedor: "vcp" })),
      ]);
    }
    await assignAllRepuestos(proveedor);
  }

  function buildMensaje(items: Repuesto[]) {
    const lista = items.map((r) => `• ${r.nombre}`).join("\n");
    return `Hola, ¿como estas? Te paso la lista de repuestos que necesito:\n\n${lista}\n\nAvisame disponibilidad y precio. Gracias!`;
  }

  async function handleWhatsApp(proveedor: "cordoba" | "vcp") {
    const tel = proveedor === "cordoba" ? telCordoba : telVcp;
    const items = proveedor === "cordoba" ? cordoba : vcp;
    if (!tel || items.length === 0) return;

    const url = buildWaUrl(tel, buildMensaje(items));
    window.open(url, "_blank");

    // Mark as pedidos
    if (proveedor === "cordoba") setCordoba([]);
    else setVcp([]);
    await markRepuestosPedidos(proveedor);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sin asignar */}
      <div
        onDragOver={(e) => handleDragOver(e, "sinAsignar")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("sinAsignar")}
        className={`rounded-xl border transition-all bg-surface-800/50 ${
          dragOverCol === "sinAsignar"
            ? "border-brand-teal ring-1 ring-brand-teal/30"
            : "border-surface-600"
        }`}
      >
        <div className="px-4 py-3 border-b border-surface-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-sm font-semibold text-gray-300">
                Sin asignar
              </span>
            </div>
            <span className="text-[0.65rem] text-gray-500 font-medium bg-surface-700 px-1.5 py-0.5 rounded">
              {sinAsignar.length}
            </span>
          </div>
          {/* Add input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoRepuesto}
              onChange={(e) => setNuevoRepuesto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRepuesto();
                }
              }}
              placeholder="Agregar repuesto..."
              className="flex-1 bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm placeholder-gray-500"
            />
            <button
              onClick={handleAddRepuesto}
              disabled={adding || !nuevoRepuesto.trim()}
              className="px-3 py-2 rounded-lg bg-brand-teal hover:bg-brand-teal-dark text-surface-900 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-3 space-y-2 min-h-[120px]">
          {sinAsignar.map((r) => (
            <RepuestoCard
              key={r.id}
              repuesto={r}
              isDragging={draggedId === r.id}
              onDragStart={() => handleDragStart(r.id)}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverCol(null);
              }}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
          {sinAsignar.length === 0 && (
            <div className="text-center py-6 text-gray-600 text-xs">
              Sin repuestos pendientes
            </div>
          )}
        </div>
      </div>

      {/* Proveedor Cordoba */}
      <ProveedorColumn
        key="cordoba"
        id="cordoba"
        label="BYTE CBA"
        accentBg="bg-orange-500/10"
        accentBorder="border-orange-500/20"
        accentText="text-orange-400"
        accentDot="bg-orange-400"
        items={cordoba}
        draggedId={draggedId}
        dragOverCol={dragOverCol}
        telefono={telCordoba}
        onTelefonoChange={saveTelCordoba}
        onDragOver={(e) => handleDragOver(e, "cordoba")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("cordoba")}
        onDragStart={handleDragStart}
        onDragEnd={() => {
          setDraggedId(null);
          setDragOverCol(null);
        }}
        onDelete={handleDelete}
        onAssignAll={() => handleAssignAll("cordoba")}
        onWhatsApp={() => handleWhatsApp("cordoba")}
        sinAsignarCount={sinAsignar.length}
      />

      {/* Proveedor VCP */}
      <ProveedorColumn
        key="vcp"
        id="vcp"
        label="TREXCELL VCP"
        accentBg="bg-cyan-500/10"
        accentBorder="border-cyan-500/20"
        accentText="text-cyan-400"
        accentDot="bg-cyan-400"
        items={vcp}
        draggedId={draggedId}
        dragOverCol={dragOverCol}
        telefono={telVcp}
        onTelefonoChange={saveTelVcp}
        onDragOver={(e) => handleDragOver(e, "vcp")}
        onDragLeave={handleDragLeave}
        onDrop={() => handleDrop("vcp")}
        onDragStart={handleDragStart}
        onDragEnd={() => {
          setDraggedId(null);
          setDragOverCol(null);
        }}
        onDelete={handleDelete}
        onAssignAll={() => handleAssignAll("vcp")}
        onWhatsApp={() => handleWhatsApp("vcp")}
        sinAsignarCount={sinAsignar.length}
      />
    </div>
  );
}

/* ── Repuesto Card ── */
function RepuestoCard({
  repuesto,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
}: {
  repuesto: Repuesto;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-surface-700 border border-surface-600 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-surface-500 group ${
        isDragging ? "opacity-40 scale-95" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{repuesto.nombre}</p>
            {repuesto.orden && (
              <p className="text-[0.65rem] text-gray-500 truncate mt-0.5">
                #{repuesto.orden.numero} - {repuesto.orden.dispositivo}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-gray-600 hover:text-brand-red hover:bg-brand-red/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ── Provider Column ── */
function ProveedorColumn({
  id,
  label,
  accentBg,
  accentBorder,
  accentText,
  accentDot,
  items,
  draggedId,
  dragOverCol,
  telefono,
  onTelefonoChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onDelete,
  onAssignAll,
  onWhatsApp,
  sinAsignarCount,
}: {
  id: string;
  label: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  accentDot: string;
  items: Repuesto[];
  draggedId: string | null;
  dragOverCol: string | null;
  telefono: string;
  onTelefonoChange: (val: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onAssignAll: () => void;
  onWhatsApp: () => void;
  sinAsignarCount: number;
}) {
  const isOver = dragOverCol === id;

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`rounded-xl border transition-all ${accentBg} ${
        isOver ? "border-brand-teal ring-1 ring-brand-teal/30" : accentBorder
      }`}
    >
      <div className={`px-4 py-3 rounded-t-xl border-b ${accentBorder}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${accentDot}`} />
            <span className={`text-sm font-semibold ${accentText}`}>
              {label}
            </span>
          </div>
          <span className="text-[0.65rem] text-gray-500 font-medium bg-surface-800/50 px-1.5 py-0.5 rounded">
            {items.length}
          </span>
        </div>

        {/* Phone input */}
        <div className="flex items-center gap-2 mb-3">
          <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <input
            type="text"
            value={telefono}
            onChange={(e) => onTelefonoChange(e.target.value)}
            placeholder="Telefono del proveedor..."
            className="flex-1 bg-surface-700/50 border border-surface-600 rounded-lg px-2.5 py-1.5 text-xs placeholder-gray-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {sinAsignarCount > 0 && (
            <button
              onClick={onAssignAll}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-surface-700 transition-colors"
            >
              <ArrowRightToLine className="w-3 h-3" />
              Agregar todos
            </button>
          )}
          <button
            onClick={onWhatsApp}
            disabled={items.length === 0 || !telefono}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-40 ml-auto"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Enviar por WhatsApp
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2 min-h-[120px]">
        {items.map((r) => (
          <RepuestoCard
            key={r.id}
            repuesto={r}
            isDragging={draggedId === r.id}
            onDragStart={() => onDragStart(r.id)}
            onDragEnd={onDragEnd}
            onDelete={() => onDelete(r.id)}
          />
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 text-gray-600 text-xs">
            Arrastra repuestos aqui
          </div>
        )}
      </div>
    </div>
  );
}
