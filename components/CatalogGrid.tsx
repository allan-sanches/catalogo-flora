"use client";

import Link from "next/link";
import Image from "next/image";
import { Leaf } from "lucide-react";
import { useCatalog } from "./CatalogProvider";
import { LuzBadges, OrigemBadge, Badge } from "./Badges";
import { PrecoResumo } from "./Precos";

export default function CatalogGrid() {
  const { filtered, items } = useCatalog();

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-title text-xl font-semibold text-primary">
          Catálogo
        </h2>
        <span className="text-sm text-base-content/55">
          {filtered.length} de {items.length} plantas
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-box border border-dashed border-base-300 p-12 text-center text-base-content/50">
          Nenhuma planta corresponde à busca/filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <Link
              key={p.slug}
              href={`/planta/${p.slug}`}
              className="card-flora group flex flex-col overflow-hidden"
            >
              <figure className="relative aspect-[4/3] w-full overflow-hidden bg-base-200">
                {p.imagem ? (
                  <Image
                    src={p.imagem}
                    alt={p.nomeComum}
                    fill
                    sizes="(max-width:768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-primary/20">
                    <Leaf className="h-12 w-12" />
                  </div>
                )}
              </figure>
              <div className="flex flex-1 flex-col gap-1.5 p-3">
                <h3 className="font-title text-base font-semibold leading-tight">
                  {p.nomeComum}
                </h3>
                <p className="-mt-0.5 text-xs italic text-base-content/55">
                  {p.nomeCientifico}
                </p>
                <PrecoResumo tamanhos={p.tamanhos} />
                <div className="mt-auto flex flex-wrap gap-1 pt-1">
                  <Badge className="badge-outline">{p.familia}</Badge>
                  <OrigemBadge origem={p.origem} />
                  <LuzBadges luz={p.luminosidade} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
