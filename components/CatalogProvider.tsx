"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Tamanho } from "@/lib/site";

export type CatalogItem = {
  slug: string;
  nomeComum: string;
  nomeCientifico: string;
  familia: string;
  genero: string;
  especie: string;
  origem: string;
  formaVida: string;
  luminosidade: string[];
  imagem: string | null;
  tamanhos: Tamanho[];
};

export type FilterDim = "luz" | "origem" | "forma";

type Filters = Record<FilterDim, string[]>;

const EMPTY: Filters = { luz: [], origem: [], forma: [] };

type CatalogCtx = {
  items: CatalogItem[];
  filtered: CatalogItem[];
  query: string;
  setQuery: (q: string) => void;
  filters: Filters;
  toggleFilter: (dim: FilterDim, value: string) => void;
  clearFilters: () => void;
  activeCount: number;
};

const Ctx = createContext<CatalogCtx | null>(null);

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function CatalogProvider({
  items,
  children,
}: {
  items: CatalogItem[];
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);

  const toggleFilter = (dim: FilterDim, value: string) =>
    setFilters((prev) => {
      const set = new Set(prev[dim]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [dim]: [...set] };
    });

  const clearFilters = () => {
    setFilters(EMPTY);
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((it) => {
      if (q) {
        const hay = [
          it.nomeComum,
          it.nomeCientifico,
          it.familia,
          it.genero,
          it.especie,
        ]
          .map(normalize)
          .some((f) => f.includes(q));
        if (!hay) return false;
      }
      if (filters.luz.length && !it.luminosidade.some((l) => filters.luz.includes(l)))
        return false;
      if (filters.origem.length && !filters.origem.includes(it.origem))
        return false;
      if (filters.forma.length && !filters.forma.includes(it.formaVida))
        return false;
      return true;
    });
  }, [items, query, filters]);

  const activeCount =
    filters.luz.length + filters.origem.length + filters.forma.length;

  const value = useMemo(
    () => ({
      items,
      filtered,
      query,
      setQuery,
      filters,
      toggleFilter,
      clearFilters,
      activeCount,
    }),
    [items, filtered, query, filters, activeCount]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCatalog() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCatalog deve ser usado dentro de CatalogProvider");
  return ctx;
}
