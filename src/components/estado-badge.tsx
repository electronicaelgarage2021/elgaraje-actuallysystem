"use client";

import { getEstadoConfig } from "@/lib/constants";
import type { EstadoOrden } from "@/lib/types";

export function EstadoBadge({ estado }: { estado: EstadoOrden }) {
  const config = getEstadoConfig(estado);
  return (
    <span className={`status-badge ${config.bgColor}`}>
      {config.label}
    </span>
  );
}
