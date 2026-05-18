export const dynamic = "force-dynamic";

import { getRepuestosPendientes } from "@/lib/actions/repuestos";
import { ProveedoresBoard } from "./proveedores-board";

export default async function ProveedoresPage() {
  const repuestos = await getRepuestosPendientes();

  const sinAsignar = repuestos.filter((r: any) => !r.proveedor);
  const cordoba = repuestos.filter((r: any) => r.proveedor === "cordoba");
  const vcp = repuestos.filter((r: any) => r.proveedor === "vcp");

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <p className="text-gray-400 text-sm mt-1">
          Arrastra los repuestos al proveedor correspondiente
        </p>
      </div>
      <ProveedoresBoard
        initialSinAsignar={sinAsignar}
        initialCordoba={cordoba}
        initialVcp={vcp}
      />

      {/* Lista de precios */}
      <div className="mt-6 bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-surface-600 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Lista de Precios — BYTE CBA</h2>
          <a
            href="https://docs.google.com/spreadsheets/d/1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc/edit?gid=222576120#gid=222576120"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-teal hover:underline"
          >
            Abrir en Google Sheets
          </a>
        </div>
        <iframe
          src="https://docs.google.com/spreadsheets/d/1lSdnSLsJHQ4bjLFC2GtaI_G85fjogyti9JzL0QT_0qc/htmlembed?gid=222576120"
          className="w-full border-0 bg-white rounded-b-xl"
          style={{ height: "500px" }}
          loading="lazy"
        />
      </div>
    </div>
  );
}
