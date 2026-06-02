"use client";

import { useState } from "react";
import { Smartphone, Square, ExternalLink, Download } from "lucide-react";

export default function PanfletoControls({ slug }: { slug: string }) {
  const [formato, setFormato] = useState<"story" | "feed">("story");
  const [preco, setPreco] = useState(false);
  const [logo, setLogo] = useState<"vertical" | "horizontal">("vertical");

  const href = `/panfleto/${slug}?f=${formato}${preco ? "&preco=1" : ""}&logo=${logo}`;

  const opt = (active: boolean) =>
    `btn btn-sm ${active ? "btn-primary" : "btn-ghost border border-base-300/60"}`;

  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs font-medium uppercase tracking-wide text-base-content/50">
          Formato
        </span>
        <button type="button" onClick={() => setFormato("story")} className={opt(formato === "story")}>
          <Smartphone className="h-4 w-4" /> Story 9:16
        </button>
        <button type="button" onClick={() => setFormato("feed")} className={opt(formato === "feed")}>
          <Square className="h-4 w-4" /> Feed 4:5
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs font-medium uppercase tracking-wide text-base-content/50">
          Logo
        </span>
        <button type="button" onClick={() => setLogo("vertical")} className={opt(logo === "vertical")}>
          Vertical
        </button>
        <button type="button" onClick={() => setLogo("horizontal")} className={opt(logo === "horizontal")}>
          Horizontal
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs font-medium uppercase tracking-wide text-base-content/50">
          Preço
        </span>
        <label className="label cursor-pointer gap-2 py-0">
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={preco}
            onChange={(e) => setPreco(e.target.checked)}
          />
          <span className="text-sm">Incluir preço (+ frete)</span>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <a href={href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm gap-2">
          <ExternalLink className="h-4 w-4" /> Abrir panfleto
        </a>
        <a
          href={href}
          download={`panfleto-${slug}-${formato}${preco ? "-com-preco" : ""}-${logo}.png`}
          className="btn btn-primary btn-outline btn-sm gap-2"
        >
          <Download className="h-4 w-4" /> Baixar
        </a>
      </div>
    </div>
  );
}
