"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { searchPriceList } from "@/lib/actions/price-list";
import type { PriceItem } from "@/lib/actions/price-list";

interface Props {
  name: string;
  placeholder?: string;
  defaultValue?: string;
}

export function RepuestoSearchInput({ name, placeholder, defaultValue = "" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [results, setResults] = useState<PriceItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const r = await searchPriceList(value);
        setResults(r);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function pick(item: PriceItem) {
    const text = `${item.categoria} ${item.marca} ${item.modelo}${item.precio ? ` ($${item.precio})` : ""}`;
    setValue(text);
    setShowResults(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder || "Buscar en lista de precios o escribir libre..."}
          className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-8 pr-3 py-2.5 text-sm placeholder-gray-500"
          autoComplete="off"
        />
      </div>
      {showResults && value.trim().length >= 2 && (
        <div className="absolute z-20 mt-1 w-full bg-surface-800 border border-surface-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-500">Buscando...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              Sin resultados. Podés escribir libre.
            </div>
          )}
          {!loading &&
            results.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pick(item)}
                className="w-full text-left px-3 py-2 hover:bg-surface-700 transition-colors border-b border-surface-700 last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{item.modelo}</p>
                    <p className="text-[0.65rem] text-gray-500">
                      {item.categoria} · {item.marca}
                    </p>
                  </div>
                  {item.precio && (
                    <span className="text-xs text-green-400 font-medium shrink-0">
                      ${item.precio}
                    </span>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
