"use client";

import { useState } from "react";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

interface WarrantyConfigProps {
  ordenId: string;
  currentWarranty?: string | null;
  onSave: (warranty: string) => void;
}

const WARRANTY_PRESETS = [
  { label: "Sin garantía", value: "Sin garantía — Reparación por golpe, agua u otro daño externo." },
  { label: "30 días — Falla de fábrica", value: "30 días de garantía — Solo cubre fallas de fábrica. No cubre golpes, agua ni daño externo." },
  { label: "60 días — Falla de fábrica", value: "60 días de garantía — Solo cubre fallas de fábrica. No cubre golpes, agua ni daño externo." },
  { label: "90 días — Falla de fábrica", value: "90 días de garantía — Solo cubre fallas de fábrica. No cubre golpes, agua ni daño externo." },
];

export function WarrantyConfig({ currentWarranty, onSave }: WarrantyConfigProps) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(currentWarranty || "");

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
      >
        <Shield className="w-3.5 h-3.5" />
        {currentWarranty ? "Garantía configurada" : "Configurar garantía"}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 bg-surface-700/50 rounded-lg p-3 border border-surface-600">
          <div className="flex flex-wrap gap-1.5">
            {WARRANTY_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setCustom(preset.value);
                  onSave(preset.value);
                }}
                className={`px-2.5 py-1 rounded-full text-[0.65rem] font-medium border transition-all ${
                  custom === preset.value
                    ? "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
                    : "bg-surface-700 text-gray-400 border-surface-600 hover:border-surface-500"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <textarea
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onBlur={() => { if (custom) onSave(custom); }}
            rows={2}
            placeholder="Escribí las condiciones de garantía..."
            className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-xs placeholder-gray-500 resize-none"
          />
        </div>
      )}
    </div>
  );
}
