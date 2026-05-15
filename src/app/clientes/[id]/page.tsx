import { getClient, getClientOrders } from "@/lib/actions/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoBadge } from "@/components/estado-badge";
import { Phone, IdCard, Mail, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let cliente, ordenes;
  try {
    [cliente, ordenes] = await Promise.all([
      getClient(id),
      getClientOrders(id),
    ]);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/clientes"
            className="text-muted-foreground hover:text-foreground"
          >
            Clientes
          </Link>
          <span className="text-muted-foreground">/</span>
        </div>
        <h1 className="text-2xl font-bold mt-1">{cliente.nombre}</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Informacion de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cliente.telefono && (
            <p className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal" />
              {cliente.telefono}
            </p>
          )}
          {cliente.dni && (
            <p className="text-sm flex items-center gap-2">
              <IdCard className="w-4 h-4 text-teal" />
              DNI: {cliente.dni}
            </p>
          )}
          {cliente.email && (
            <p className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal" />
              {cliente.email}
            </p>
          )}
          {cliente.notas && (
            <p className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal" />
              {cliente.notas}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Ordenes ({ordenes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordenes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Sin ordenes registradas
            </p>
          ) : (
            <div className="space-y-2">
              {ordenes.map((orden) => (
                <Link
                  key={orden.id}
                  href={`/ordenes/${orden.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{orden.numero}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{orden.dispositivo}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(orden.fecha_ingreso),
                          "dd/MM/yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                  </div>
                  <EstadoBadge estado={orden.estado} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
