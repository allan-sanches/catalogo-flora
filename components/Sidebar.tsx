"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ChevronRight,
  Pin,
  X,
  SlidersHorizontal,
  Settings,
  Store,
  FileDown,
  Sun,
  CloudSun,
  Moon,
  Leaf,
} from "lucide-react";
import Logo, { type Marca } from "./Logo";
import PriceToggle from "./PriceToggle";
import { STORE_URL } from "@/lib/site";
import { useCatalog, type FilterDim } from "./CatalogProvider";

const LUZ_ICON: Record<string, typeof Sun> = {
  Sol: Sun,
  "Meia-luz": CloudSun,
  Sombra: Moon,
};

function FilterGroup({
  dim,
  label,
  options,
}: {
  dim: FilterDim;
  label: string;
  options: string[];
}) {
  const { filters, toggleFilter } = useCatalog();
  if (options.length === 0) return null;
  return (
    <div>
      <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-base-content/45">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = filters[dim].includes(opt);
          const Icon = dim === "luz" ? LUZ_ICON[opt] : null;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggleFilter(dim, opt)}
              aria-pressed={active}
              className={`badge gap-1 border transition ${
                active
                  ? "badge-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-base-100"
                  : "badge-ghost hover:border-primary/40"
              }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({
  marca,
  pinned,
  onTogglePin,
  onCloseMobile,
}: {
  marca: Marca;
  pinned: boolean;
  onTogglePin: () => void;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const { items, filtered, query, setQuery, activeCount, clearFilters } =
    useCatalog();

  const [showFilters, setShowFilters] = useState(true);
  const [openGenera, setOpenGenera] = useState<Set<string>>(new Set());

  // restaura gêneros abertos
  useEffect(() => {
    try {
      const raw = localStorage.getItem("flora:open-genera");
      if (raw) setOpenGenera(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggleGenus = (g: string) =>
    setOpenGenera((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      try {
        localStorage.setItem("flora:open-genera", JSON.stringify([...next]));
      } catch {}
      return next;
    });

  // opções de filtro derivadas do catálogo
  const opts = useMemo(() => {
    const luz = new Set<string>();
    const origem = new Set<string>();
    const forma = new Set<string>();
    for (const it of items) {
      it.luminosidade.forEach((l) => luz.add(l));
      if (it.origem) origem.add(it.origem);
      if (it.formaVida) forma.add(it.formaVida);
    }
    const ordemLuz = ["Sol", "Meia-luz", "Sombra"];
    return {
      luz: [...luz].sort((a, b) => ordemLuz.indexOf(a) - ordemLuz.indexOf(b)),
      origem: [...origem].sort(),
      forma: [...forma].sort(),
    };
  }, [items]);

  // agrupa o índice (já filtrado) por gênero
  const grupos = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const it of filtered) {
      const g = it.genero?.trim() || "Outros";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    for (const arr of map.values())
      arr.sort((a, b) => a.nomeComum.localeCompare(b.nomeComum, "pt-BR"));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [filtered]);

  const activeGenus = useMemo(() => {
    const m = pathname?.match(/^\/planta\/(.+)$/);
    if (!m) return null;
    return items.find((i) => i.slug === m[1])?.genero ?? null;
  }, [pathname, items]);

  const searching = query.trim().length > 0 || activeCount > 0;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-base-300 bg-base-100">
      {/* Marca + ações */}
      <div className="flex items-center gap-1 border-b border-base-300 px-3 py-3">
        <div className="min-w-0 flex-1">
          <Logo marca={marca} />
        </div>
        <button
          type="button"
          onClick={onTogglePin}
          title={pinned ? "Desafixar barra lateral" : "Fixar barra lateral"}
          className={`btn btn-ghost btn-xs btn-square ${
            pinned ? "text-primary" : "opacity-50"
          }`}
        >
          <Pin className="h-4 w-4" fill={pinned ? "currentColor" : "none"} />
        </button>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="btn btn-ghost btn-xs btn-square lg:hidden"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="px-3 py-3">
        <label className="input input-sm input-bordered flex items-center gap-2">
          <Search className="h-4 w-4 opacity-50" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar família, gênero ou espécie…"
            className="grow"
            autoComplete="off"
          />
        </label>
      </div>

      {/* Filtros */}
      <div className="border-y border-base-200 bg-base-200/40 px-3 py-2">
        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="flex w-full items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-base-content/55"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
          {activeCount > 0 && (
            <span className="badge badge-primary badge-xs">{activeCount}</span>
          )}
          <ChevronRight
            className={`ml-auto h-3.5 w-3.5 transition-transform ${
              showFilters ? "rotate-90" : ""
            }`}
          />
        </button>
        {showFilters && (
          <div className="space-y-3 pt-3">
            <FilterGroup dim="luz" label="Luminosidade" options={opts.luz} />
            <FilterGroup dim="origem" label="Origem" options={opts.origem} />
            <FilterGroup dim="forma" label="Forma de vida" options={opts.forma} />
            {(activeCount > 0 || query) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-ghost btn-xs gap-1 text-base-content/60"
              >
                <X className="h-3 w-3" /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Índice por gênero (colapsável) */}
      <nav className="scroll-thin flex-1 overflow-y-auto px-2 py-2">
        <p className="px-2 pb-1 text-[11px] text-base-content/45">
          {filtered.length} de {items.length} plantas
        </p>
        {grupos.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-base-content/50">
            Nenhuma planta encontrada.
          </p>
        )}
        {grupos.map(([genero, plantas]) => {
          const open = searching || activeGenus === genero || openGenera.has(genero);
          return (
            <div key={genero} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggleGenus(genero)}
                aria-expanded={open}
                className="group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm font-medium hover:bg-base-200"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 opacity-60 transition-transform ${
                    open ? "rotate-90" : ""
                  }`}
                />
                <Leaf className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="flex-1 italic">{genero}</span>
                <span className="badge badge-ghost badge-sm">{plantas.length}</span>
              </button>
              {open && (
                <ul className="menu menu-sm w-full gap-0.5 py-0.5 pl-4">
                  {plantas.map((p) => {
                    const href = `/planta/${p.slug}`;
                    const active = pathname === href;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={href}
                          onClick={onCloseMobile}
                          className={active ? "active font-medium" : ""}
                        >
                          <span className="flex flex-col items-start leading-tight">
                            <span>{p.nomeComum}</span>
                            <span className="text-xs italic text-base-content/45">
                              {p.nomeCientifico}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Rodapé: preços + loja + edição */}
      <div className="space-y-1 border-t border-base-300 p-2">
        <PriceToggle className="w-full" />
        <a
          href={STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success btn-sm w-full justify-start gap-2 text-success-content"
        >
          <Store className="h-4 w-4" /> Ver na loja
        </a>
        <a
          href="/catalogo/pdf"
          className="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/70"
        >
          <FileDown className="h-4 w-4" /> Baixar catálogo (PDF)
        </a>
        <Link
          href="/keystatic"
          className="btn btn-ghost btn-sm w-full justify-start gap-2 text-base-content/60"
        >
          <Settings className="h-4 w-4" /> Painel de edição
        </Link>
      </div>
    </aside>
  );
}
