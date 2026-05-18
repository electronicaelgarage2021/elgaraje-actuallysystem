export const dynamic = "force-dynamic";

import { getRepuestosPendientes } from "@/lib/actions/repuestos";
import { fetchPriceList } from "@/lib/actions/price-list";
import { ProveedoresBoard } from "./proveedores-board";
import { PriceList } from "./price-list";

export default async function ProveedoresPage() {
  const [repuestos, priceData] = await Promise.all([
    getRepuestosPendientes(),
    fetchPriceList(),
  ]);

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
      <PriceList data={priceData} />
    </div>
  );
}
