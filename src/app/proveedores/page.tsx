export const dynamic = "force-dynamic";

import { getRepuestosPendientes, getOrdenesActivas } from "@/lib/actions/repuestos";
import { getOrdersToday } from "@/lib/actions/orders";
import { ProveedoresBoard } from "./proveedores-board";
import { RepuestosForm } from "./repuestos-form";
import { IngresosHoy } from "./ingresos-hoy";

export default async function ProveedoresPage() {
  const [repuestos, ingresosHoy, ordenesActivas] = await Promise.all([
    getRepuestosPendientes(),
    getOrdersToday(),
    getOrdenesActivas(),
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
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <RepuestosForm ordenesActivas={ordenesActivas} />
        <IngresosHoy data={ingresosHoy as any} />
      </div>
    </div>
  );
}
