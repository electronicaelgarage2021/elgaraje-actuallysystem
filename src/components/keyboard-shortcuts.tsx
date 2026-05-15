"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          router.push("/ordenes/nueva");
          break;
        case "k":
          e.preventDefault();
          router.push("/kanban");
          break;
        case "/":
          e.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
          break;
        case "?":
          e.preventDefault();
          setShowHelp((v) => !v);
          break;
        case "escape":
          setShowHelp(false);
          break;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center modal-overlay" onClick={() => setShowHelp(false)}>
      <div className="bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-surface-600">
          <h2 className="font-semibold">Atajos de teclado</h2>
        </div>
        <div className="p-5 space-y-3">
          {[
            { key: "N", desc: "Nueva orden" },
            { key: "K", desc: "Kanban" },
            { key: "/", desc: "Buscar" },
            { key: "?", desc: "Mostrar atajos" },
            { key: "Esc", desc: "Cerrar" },
          ].map((s) => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{s.desc}</span>
              <kbd className="bg-surface-700 border border-surface-600 px-2.5 py-1 rounded text-xs font-mono text-gray-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
