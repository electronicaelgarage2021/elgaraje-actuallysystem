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
    </div>
  );
}
