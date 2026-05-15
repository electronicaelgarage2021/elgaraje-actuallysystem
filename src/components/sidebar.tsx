"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Users,
  PlusCircle,
  MapPin,
  Columns3,
  Wallet,
  CalendarDays,
} from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { NEGOCIO } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ordenes", label: "Reparaciones", icon: Wrench },
  { href: "/kanban", label: "Kanban", icon: Columns3 },
  { href: "/ordenes/nueva", label: "Nueva Orden", icon: PlusCircle },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/caja", label: "Caja Diaria", icon: Wallet },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-800 border-r border-surface-600 flex flex-col z-50">
      <div className="p-5 border-b border-surface-600">
        <Logo size="md" />
        <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-[0.55rem]">
          <MapPin className="w-2.5 h-2.5" />
          <span>{NEGOCIO.direccion}</span>
        </div>
        {/* Brand accent line */}
        <div className="mt-3 flex gap-1">
          <div className="h-0.5 flex-1 bg-brand-red rounded" />
          <div className="h-0.5 flex-[3] bg-brand-teal rounded" />
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const exactMatch = pathname === item.href;
          const isActive =
            item.href === "/"
              ? exactMatch
              : item.href === "/ordenes"
                ? pathname === "/ordenes" || (pathname.startsWith("/ordenes/") && !pathname.startsWith("/ordenes/nueva"))
                : item.href === "/clientes"
                  ? pathname.startsWith("/clientes")
                  : exactMatch;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border-l-2 transition-all ${
                isActive
                  ? "bg-brand-teal/15 text-brand-teal border-l-brand-teal"
                  : "text-gray-400 hover:text-white hover:bg-surface-700 border-transparent"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-teal/20 flex items-center justify-center text-brand-teal text-xs font-bold">
              M
            </div>
            <div>
              <div className="text-sm font-medium">Marc</div>
              <div className="text-xs text-gray-500">Villa Carlos Paz</div>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
