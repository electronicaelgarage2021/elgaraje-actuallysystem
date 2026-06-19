import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import { PWARegister } from "@/components/pwa-register";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { PrankPopup } from "@/components/prank-popup";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Electronica El Garage - Sistema",
  description: "Sistema de gestion de reparaciones",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "El Garage",
  },
};

export const viewport: Viewport = {
  themeColor: "#00BFA5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex font-sans">
        <TooltipProvider>
          <PWARegister />
          <KeyboardShortcuts />
          <PrankPopup />
          <Sidebar />
          <main className="ml-64 flex-1 min-h-screen overflow-y-auto scrollbar-thin">
            <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
          </main>
        </TooltipProvider>
      </body>
    </html>
  );
}
