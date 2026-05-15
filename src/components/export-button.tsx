"use client";

import { useState } from "react";
import { exportOrders } from "@/lib/actions/orders";
import { Download } from "lucide-react";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const ordenes = await exportOrders();

    const headers = ["Numero", "Cliente", "DNI", "Telefono", "Dispositivo", "Problema", "Estado", "Presupuesto", "Fecha Ingreso", "Garantia"];
    const rows = ordenes.map((o: any) => [
      o.numero,
      o.cliente?.nombre || "",
      o.cliente?.dni || "",
      o.cliente?.telefono || "",
      o.dispositivo,
      o.problema,
      o.estado,
      o.presupuesto || "",
      o.fecha_ingreso?.split("T")[0] || "",
      o.garantia || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const bom = "﻿";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elgarage-backup-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="bg-surface-700 hover:bg-surface-600 text-gray-300 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {loading ? "Exportando..." : "Exportar CSV"}
    </button>
  );
}
