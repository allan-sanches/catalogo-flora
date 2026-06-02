"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Menu, PanelLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import Logo, { type Marca } from "./Logo";
import PriceToggle from "./PriceToggle";

export default function SiteShell({
  children,
  marca,
}: {
  children: ReactNode;
  marca: Marca;
}) {
  const [pinned, setPinned] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("flora:sidebar-pinned");
      if (v !== null) setPinned(v === "true");
    } catch {}
  }, []);

  const setPin = (v: boolean) => {
    setPinned(v);
    try {
      localStorage.setItem("flora:sidebar-pinned", String(v));
    } catch {}
  };

  // Atalho Ctrl/Cmd + B
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setPin(!pinned);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa (desktop) */}
      {pinned && (
        <div className="sticky top-0 hidden h-screen lg:block">
          <Sidebar marca={marca} pinned onTogglePin={() => setPin(false)} />
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="h-full shadow-2xl">
            <Sidebar
              marca={marca}
              pinned={pinned}
              onTogglePin={() => setPin(!pinned)}
              onCloseMobile={() => setMobileOpen(false)}
            />
          </div>
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex-1 bg-base-content/40 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar slim */}
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-base-300 bg-base-100/85 px-3 py-2 backdrop-blur">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="btn btn-ghost btn-sm btn-square lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {!pinned && (
            <button
              type="button"
              onClick={() => setPin(true)}
              className="btn btn-ghost btn-sm btn-square hidden lg:flex"
              title="Mostrar barra lateral (Ctrl+B)"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          )}

          {/* Logo no topo quando a sidebar não está visível */}
          <div className={pinned ? "lg:hidden" : ""}>
            <Logo marca={marca} compact />
          </div>

          <div className="ml-auto">
            <PriceToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>

        <footer className="border-t border-base-300 bg-base-100 px-6 py-5 text-center text-sm text-base-content/55">
          Flora Mattos · Cultivo Afetivo — dados inspirados na{" "}
          <a
            className="link link-hover"
            href="https://floradobrasil.jbrj.gov.br"
            target="_blank"
            rel="noopener noreferrer"
          >
            Flora e Funga do Brasil (JBRJ)
          </a>
        </footer>
      </div>
    </div>
  );
}
