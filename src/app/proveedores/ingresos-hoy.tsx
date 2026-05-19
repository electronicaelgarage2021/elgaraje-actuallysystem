import Link from "next/link";
import { Calendar, Smartphone, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface IngresoHoy {
  id: string;
  numero: number;
  dispositivo: string;
  problema: string;
  estado: string;
  fecha_ingreso: string;
  cliente: { nombre: string; telefono: string | null } | { nombre: string; telefono: string | null }[] | null;
}

const ESTADO_COLORS: Record<string, string> = {
  recibido: "bg-blue-500/10 text-blue-400",
  en_proceso: "bg-purple-500/10 text-purple-400",
  esperando_repuesto: "bg-yellow-500/10 text-yellow-400",
  finalizado: "bg-green-500/10 text-green-400",
  entregado: "bg-gray-500/10 text-gray-400",
};

const ESTADO_LABELS: Record<string, string> = {
  recibido: "Recibido",
  en_proceso: "En proceso",
  esperando_repuesto: "Esperando repuesto",
  finalizado: "Finalizado",
  entregado: "Entregado",
};

function getCliente(c: IngresoHoy["cliente"]): { nombre: string; telefono: string | null } | null {
  if (!c) return null;
  if (Array.isArray(c)) return c[0] || null;
  return c;
}

export function IngresosHoy({ data }: { data: IngresoHoy[] }) {
  const hoy = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-surface-600 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-brand-teal" />
            Ingresos del día
          </h2>
          <p className="text-[0.65rem] text-gray-500 capitalize mt-0.5">{hoy}</p>
        </div>
        <span className="text-[0.65rem] text-gray-500 font-medium bg-surface-700 px-2 py-0.5 rounded">
          {data.length}
        </span>
      </div>

      <div style={{ maxHeight: "508px", overflowY: "auto" }}>
        {data.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-500 text-sm">
            <Smartphone className="w-8 h-8 mx-auto mb-2 text-gray-700" />
            Sin ingresos hoy
          </div>
        ) : (
          <div className="divide-y divide-surface-700">
            {data.map((orden) => {
              const cliente = getCliente(orden.cliente);
              const hora = format(new Date(orden.fecha_ingreso), "HH:mm");
              return (
                <Link
                  key={orden.id}
                  href={`/ordenes/${orden.id}`}
                  className="block px-5 py-3 hover:bg-surface-700/40 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.65rem] text-gray-500 font-mono">
                          #{orden.numero}
                        </span>
                        <span className="text-[0.6rem] text-gray-600">{hora}</span>
                        <span
                          className={`text-[0.6rem] px-1.5 py-0.5 rounded font-medium ${
                            ESTADO_COLORS[orden.estado] || "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {ESTADO_LABELS[orden.estado] || orden.estado}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{orden.dispositivo}</p>
                      {cliente?.nombre && (
                        <p className="text-xs text-gray-500 truncate">{cliente.nombre}</p>
                      )}
                      <p className="text-[0.65rem] text-gray-600 truncate mt-0.5">
                        {orden.problema}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-brand-teal shrink-0 mt-1 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
