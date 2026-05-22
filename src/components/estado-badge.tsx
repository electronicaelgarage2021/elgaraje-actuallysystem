"use client";

import { getEstadoConfig } from "@/lib/constants";
import type { EstadoOrden } from "@/lib/types";

export function EstadoBadge({ estado, sinReparacion }: { estado: EstadoOrden; sinReparacion?: boolean }) {
  if (sinReparacion) {
    return (
      <span className="status-badge bg-yellow-500/15 text-yellow-400">
        Sin reparación
      </span>
    );
  }
  const config = getEstadoConfig(estado);
  return (
    <span className={`status-badge ${config.bgColor}`}>
      {config.label}
    </span>
  );
}
