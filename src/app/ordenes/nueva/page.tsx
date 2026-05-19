"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { METODOS_PAGO } from "@/lib/constants";
import { createOrder } from "@/lib/actions/orders";
import { searchClients } from "@/lib/actions/clients";
import { DeviceHistoryHint } from "@/components/device-history-hint";
import { RepuestoSearchInput } from "@/components/repuesto-search-input";
import {
  X,
  DollarSign,
  Percent,
  UserPlus,
  Search,
  User,
  Smartphone,
  Wrench,
  Info,
} from "lucide-react";
import type { Cliente } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TIPOS_REPARACION = [
  "Pin de carga",
  "Módulo",
  "Parlante",
  "Software",
  "Batería",
  "Baño químico",
  "Micrófono",
  "Otro",
];

export default function NuevaOrden() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [resultadosCliente, setResultadosCliente] = useState<Cliente[]>([]);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [conSena, setConSena] = useState(false);
  const [modoSena, setModoSena] = useState<"pesos" | "porcentaje">("pesos");
  const [senaValue, setSenaValue] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([]);
  const [dispositivo, setDispositivo] = useState("");
  const [prioridad, setPrioridad] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fechaHoy = format(new Date(), "dd/MM/yyyy", { locale: es });

  useEffect(() => {
    if (busquedaCliente.length < 2) {
      setResultadosCliente([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await searchClients(busquedaCliente);
      setResultadosCliente(results as Cliente[]);
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaCliente]);

  const senaFinal =
    modoSena === "porcentaje" && presupuesto
      ? (Number(senaValue) / 100) * Number(presupuesto)
      : Number(senaValue);

  function toggleTipo(tipo: string) {
    setTiposSeleccionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      if (clienteSeleccionado) {
        fd.set("cliente_id", clienteSeleccionado.id);
      }
      if (conSena && senaValue) {
        fd.set("sena", String(senaFinal));
      }
      fd.set("prioridad", String(prioridad));
      await createOrder(fd);
      router.push("/ordenes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear la orden";
      setErrorMsg(msg);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto relative fade-in">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="absolute top-0 right-0 w-10 h-10 rounded-full bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-6 pr-12">
        <h1 className="text-2xl font-bold">Nueva Orden de Reparación</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-gray-400 text-sm">Registrar nuevo ingreso</p>
          <span className="text-[0.65rem] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full font-medium">
            {fechaHoy}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-teal" />
            Datos del Cliente
          </h2>

          {!clienteSeleccionado && !mostrarNuevoCliente && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre y Apellido *</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar cliente existente..."
                      value={busquedaCliente}
                      onChange={(e) => setBusquedaCliente(e.target.value)}
                      className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-brand-teal hover:underline"
                    >
                      Buscar
                    </button>
                  </div>
                  <p className="text-[0.65rem] text-gray-600 mt-1">Si ya es cliente, buscá por nombre o DNI</p>
                </div>
              </div>

              {resultadosCliente.length > 0 && (
                <div className="border border-surface-600 rounded-lg overflow-hidden">
                  {resultadosCliente.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setClienteSeleccionado(c);
                        setBusquedaCliente("");
                        setResultadosCliente([]);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-surface-700 transition-colors border-b border-surface-600 last:border-0"
                    >
                      <p className="text-sm font-medium">{c.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {c.telefono}
                        {c.dni ? ` — DNI: ${c.dni}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMostrarNuevoCliente(true)}
                className="w-full py-2.5 rounded-lg text-sm font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Nuevo cliente
              </button>
            </div>
          )}

          {clienteSeleccionado && (
            <div className="flex items-center justify-between p-3 bg-surface-700/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">{clienteSeleccionado.nombre}</p>
                <p className="text-xs text-gray-500">{clienteSeleccionado.telefono}</p>
              </div>
              <button
                type="button"
                onClick={() => setClienteSeleccionado(null)}
                className="text-xs text-brand-teal hover:underline"
              >
                Cambiar
              </button>
            </div>
          )}

          {mostrarNuevoCliente && !clienteSeleccionado && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Nuevo cliente</span>
                <button
                  type="button"
                  onClick={() => setMostrarNuevoCliente(false)}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nombre y Apellido *</label>
                  <input
                    name="cliente_nombre"
                    required
                    placeholder="Ej: Juan Pérez"
                    className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">DNI *</label>
                  <input
                    name="cliente_dni"
                    placeholder="Ej: 35.410.825"
                    className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Teléfono / WhatsApp *</label>
                  <input
                    name="cliente_telefono"
                    required
                    placeholder="Ej: 3541-629056"
                    className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email (opcional)</label>
                  <input
                    name="cliente_email"
                    type="email"
                    placeholder="Ej: juan@email.com"
                    className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Equipo */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-teal" />
            Datos del Equipo
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Dispositivo *</label>
              <input
                name="dispositivo"
                required
                value={dispositivo}
                onChange={(e) => setDispositivo(e.target.value)}
                placeholder="Ej: Samsung A54, Moto G24, iPhone 11"
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500"
              />
              <DeviceHistoryHint dispositivo={dispositivo} />
            </div>
          </div>
        </div>

        {/* Reparación */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-brand-teal" />
            Detalle de Reparación
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Problema reportado *</label>
              <textarea
                name="problema"
                required
                rows={2}
                placeholder="Ej: No carga, se le mojó, pantalla rota..."
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tipo de reparación</label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_REPARACION.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => toggleTipo(tipo)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      tiposSeleccionados.includes(tipo)
                        ? "bg-brand-teal/15 text-brand-teal border-brand-teal/30"
                        : "bg-surface-700 text-gray-400 border-surface-600"
                    }`}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setPrioridad(!prioridad)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  prioridad
                    ? "bg-brand-red text-white"
                    : "bg-surface-700 text-gray-400 border border-surface-600"
                }`}
              >
                {prioridad ? "⚡ Prioridad alta" : "Prioridad"}
              </button>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Presupuesto estimado</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  name="presupuesto"
                  type="number"
                  placeholder="15000"
                  value={presupuesto}
                  onChange={(e) => setPresupuesto(e.target.value)}
                  className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Notas internas (opcional)</label>
              <textarea
                name="observaciones"
                rows={2}
                placeholder="Notas que solo vos ves..."
                className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 resize-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1 block">Repuesto necesario (opcional)</label>
              <RepuestoSearchInput
                name="repuesto"
                placeholder="Buscar en lista de precios o escribir libre..."
              />
              <p className="text-[0.65rem] text-gray-600 mt-1">
                Buscá en la lista de BYTE o escribí cualquier cosa
              </p>
            </div>
          </div>
        </div>

        {/* Pago / Seña */}
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-5">
          <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-teal" />
            Pago
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">¿El cliente deja seña?</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConSena(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${conSena ? "toggle-active" : "toggle-inactive"}`}
                >
                  Sí, deja seña
                </button>
                <button
                  type="button"
                  onClick={() => setConSena(false)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${!conSena ? "toggle-active" : "toggle-inactive"}`}
                >
                  No, paga al retirar
                </button>
              </div>
            </div>

            {conSena && (
              <div className="space-y-3 p-4 bg-surface-700/50 rounded-lg border border-surface-600">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Monto de la seña</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setModoSena("pesos")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${modoSena === "pesos" ? "toggle-active" : "toggle-inactive"}`}
                    >
                      $ Pesos
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoSena("porcentaje")}
                      disabled={!presupuesto}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${modoSena === "porcentaje" ? "toggle-active" : "toggle-inactive"} disabled:opacity-40`}
                    >
                      % del presupuesto
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {modoSena === "pesos" ? "$" : "%"}
                      </span>
                      <input
                        type="number"
                        placeholder={modoSena === "pesos" ? "5000" : "50"}
                        value={senaValue}
                        onChange={(e) => setSenaValue(e.target.value)}
                        className="w-full bg-surface-700 border border-surface-600 rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder-gray-500"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <select
                      name="metodo_sena"
                      defaultValue="efectivo"
                      className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2.5 text-sm text-gray-300"
                    >
                      {METODOS_PAGO.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {modoSena === "porcentaje" && senaValue && presupuesto && (
                  <div className="text-xs text-gray-500">
                    = ${senaFinal.toLocaleString("es-AR")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Legal notice */}
        <div className="bg-surface-700/50 border border-surface-600 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-3.5 h-3.5 text-brand-teal shrink-0" />
            La fecha de ingreso se registra automáticamente. Estado inicial: <strong className="text-blue-400">Recibido</strong>.
          </div>
          <p className="text-[0.65rem] text-gray-500 leading-relaxed">
            Según Código Civil Ley 2375/2526. Se toma por ABANDONADO el bien luego de los 90 días de estadía.
          </p>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-brand-red/10 border border-brand-red/30 rounded-lg p-3 text-sm text-brand-red">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-surface-700 text-gray-300 hover:bg-surface-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal hover:bg-brand-teal-dark text-surface-900 transition-colors disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Orden"}
          </button>
        </div>
      </form>
    </div>
  );
}
