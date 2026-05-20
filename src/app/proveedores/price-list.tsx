"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ExternalLink, RefreshCw, Plus, Check, Link2 } from "lucide-react";
import type { PriceItem } from "@/lib/actions/price-list";
import { createRepuesto } from "@/lib/actions/repuestos";

interface OrdenActiva {
  id: string;
  numero: number;
  dispositivo: string;
  cliente: { nombre: string } | { nombre: string }[] | null;
}

function getClienteName(c: OrdenActiva["cliente"]): string {
  if (!c) return "";
  if (Array.isArray(c)) return c[0]?.nombre || "";
  return c.nombre;
}

export function PriceList({ data, ordenesActivas }: { data: PriceItem[]; ordenesActivas: OrdenActiva[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const [popupItem, setPopupItem] = useState<{ item: PriceItem; rowIdx: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupItem(null);
      }
    }
    if (popupItem) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popupItem]);

  function handleAdd(item: PriceItem, ordenId?: string, ordenInfo?: { numero: number; dispositivo: string }) {
    const key = `${item.categoria}|${item.marca}|${item.modelo}`;
    const nombre = `${item.categoria} ${item.marca} ${item.modelo}${item.precio ? ` ($${item.precio})` : ""}`;
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const precio = item.precio ? Number(item.precio.replace(/[^0-9]/g, "")) : undefined;
    setAdded((prev) => new Set(prev).add(key));
    setPopupItem(null);
    setTimeout(() => {
      setAdded((prev) => {
        const n = new Set(prev);
        n.delete(key);
        return n;
      });
    }, 1500);
    window.dispatchEvent(
      new CustomEvent("repuesto-optimistic-add", {
        detail: {
          id: tempId,
          nombre,
          proveedor: null,
          orden: ordenInfo ? { numero: ordenInfo.numero, dispositivo: ordenInfo.dispositivo } : null,
        },
      })
    );
    startTransition(async () => {
      try {
        await createRepuesto(nombre, ordenId, precio);
        router.refresh();
      } catch (e) {
        console.error("Error agregando repuesto:", e);
        window.dispatchEvent(
          new CustomEvent("repuesto-optimistic-remove", { detail: { id: tempId } })
        );
        alert("Error al agregar repuesto, intentá de nuevo");
      }
    });
  }

  const categorias = [...new Set(data.map((i) => i.categoria))];

  if (data.length === 0) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center text-gray-500 text-sm">
        No se pudo cargar la lista de precios
      </div>
    );
  }

  const byCategoria = filterCategoria
    ? data.filter((i) => i.categoria === filterCategoria)
    : data;

  const marcas = [...new Set(byCategoria.map((i) => i.marca))];

  const filtered = query.trim()
    ? byCategoria.filter(
        (item) =>
          item.modelo.toLowerCase().includes(query.toLowerCase()) ||
          item.marca.toLowerCase().includes(query.toLowerCase()) ||
          item.categoria.toLowerCase().includes(query.toLowerCase())
      )
    : byCategoria;

  const shown = filterMarca
    ? filtered.filter((i) => i.marca === filterMarca)
    : filtered;

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600 flex flex-col md:flex-row md:items-center justify-between gap-2 min-h-[3.25rem]">
        <h2 className="text-sm font-semibold shrink-0">Lista de Precios — BYTE CBA</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar repuesto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-surface-700 border border-surface-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-300 placeholder-gray-500 w-48 md:w-64"
            />
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc/edit?gid=222576120#gid=222576120"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-teal hover:bg-brand-teal/10 transition-colors"
            title="Abrir en Google Sheets"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="px-5 py-2 border-b border-surface-600 flex flex-wrap gap-1.5">
        <button
          onClick={() => {
            setFilterCategoria("");
            setFilterMarca("");
          }}
          className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors ${
            !filterCategoria
              ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
              : "bg-surface-700 text-gray-400 hover:bg-surface-600"
          }`}
        >
          Todas las categorías
        </button>
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => {
              setFilterCategoria(c === filterCategoria ? "" : c);
              setFilterMarca("");
            }}
            className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors ${
              filterCategoria === c
                ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                : "bg-surface-700 text-gray-400 hover:bg-surface-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filterCategoria && marcas.length > 1 && (
        <div className="px-5 py-2 border-b border-surface-600 flex flex-wrap gap-1.5 bg-surface-900/30">
          <button
            onClick={() => setFilterMarca("")}
            className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors ${
              !filterMarca
                ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                : "bg-surface-700 text-gray-400 hover:bg-surface-600"
            }`}
          >
            Todas las marcas
          </button>
          {marcas.map((m) => (
            <button
              key={m}
              onClick={() => setFilterMarca(m === filterMarca ? "" : m)}
              className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium transition-colors ${
                filterMarca === m
                  ? "bg-brand-teal/15 text-brand-teal border border-brand-teal/30"
                  : "bg-surface-700 text-gray-400 hover:bg-surface-600"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      <div style={{ maxHeight: "450px", overflowY: "auto" }}>
        <table className="w-full text-sm table-fixed">
          <colgroup>
            <col className="w-[22%]" />
            <col />
            <col className="w-[22%]" />
            <col className="w-[36px]" />
          </colgroup>
          <thead className="sticky top-0 bg-surface-800 z-10">
            <tr className="border-b border-surface-600 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-3 py-2.5 text-left font-medium">Marca</th>
              <th className="px-3 py-2.5 text-left font-medium">Modelo</th>
              <th className="px-2 py-2.5 text-right font-medium">Precio</th>
              <th className="px-1 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {shown.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Sin resultados{query ? ` para "${query}"` : ""}
                </td>
              </tr>
            ) : (
              shown.map((item, i) => {
                const key = `${item.categoria}|${item.marca}|${item.modelo}`;
                const isAdded = added.has(key);
                const isPopupOpen = popupItem?.rowIdx === i;
                return (
                <tr key={i} className="card-hover relative">
                  <td className="px-3 py-2 text-gray-400 text-xs truncate">{item.marca}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="truncate">{item.modelo}</div>
                    <div className="text-[0.6rem] text-gray-600 truncate">{item.categoria}</div>
                  </td>
                  <td className="px-2 py-2 text-right text-green-400 font-medium text-xs whitespace-nowrap">
                    {item.precio ? `$${item.precio}` : "-"}
                  </td>
                  <td className="px-1 py-2 text-center relative">
                    <button
                      onClick={() => {
                        if (ordenesActivas.length === 0) {
                          handleAdd(item);
                        } else {
                          setPopupItem(isPopupOpen ? null : { item, rowIdx: i });
                        }
                      }}
                      title={isAdded ? "¡Agregado!" : "Agregar repuesto"}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isAdded
                          ? "text-green-400 bg-green-400/10"
                          : "text-gray-500 hover:text-brand-teal hover:bg-brand-teal/10"
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                    {isPopupOpen && (
                      <div
                        ref={popupRef}
                        className="absolute right-0 top-full mt-1 z-50 bg-surface-700 border border-surface-600 rounded-lg shadow-xl w-64 overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-surface-600 text-[0.65rem] text-gray-400 font-medium">
                          Vincular a orden
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          <button
                            onClick={() => handleAdd(item)}
                            className="w-full px-3 py-2 text-left hover:bg-surface-600 transition-colors flex items-center gap-2"
                          >
                            <Plus className="w-3 h-3 text-gray-500 shrink-0" />
                            <span className="text-xs text-gray-300">Sin asignar a orden</span>
                          </button>
                          {ordenesActivas.map((o) => (
                            <button
                              key={o.id}
                              onClick={() => handleAdd(item, o.id, { numero: o.numero, dispositivo: o.dispositivo })}
                              className="w-full px-3 py-2 text-left hover:bg-surface-600 transition-colors flex items-center gap-2"
                            >
                              <Link2 className="w-3 h-3 text-brand-teal shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs text-gray-200 truncate">
                                  <span className="text-gray-500 font-mono">#{o.numero}</span>{" "}
                                  {o.dispositivo}
                                </div>
                                <div className="text-[0.6rem] text-gray-500 truncate">
                                  {getClienteName(o.cliente)}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-2 border-t border-surface-600 text-[0.65rem] text-gray-600">
        <div className="flex items-center gap-1.5 mb-1">
          <RefreshCw className="w-3 h-3" />
          Se actualiza cada 5 min · {shown.length} de {data.length} productos
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-gray-700">
          {categorias.map((c) => {
            const count = data.filter((i) => i.categoria === c).length;
            return (
              <span key={c}>
                {c}: <span className="text-gray-500">{count}</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
