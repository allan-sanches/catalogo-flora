import { FileDown } from "lucide-react";
import CatalogGrid from "@/components/CatalogGrid";

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-box shadow-soft bg-gradient-to-br from-primary/10 via-base-100 to-accent/10 px-6 py-8">
        <p className="font-title text-xs uppercase tracking-[0.3em] text-primary/70">
          Cultivo Afetivo
        </p>
        <h1 className="font-title text-3xl font-semibold text-primary">
          Catálogo de Plantas Flora Mattos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-base-content/65">
          Use a busca e os filtros na barra lateral para encontrar plantas por
          família, gênero, espécie, luminosidade ou origem. Clique em uma planta
          para ver detalhes e falar com a loja no WhatsApp.
        </p>
        <a
          href="/catalogo/pdf"
          className="btn btn-primary btn-sm mt-4 gap-2"
        >
          <FileDown className="h-4 w-4" /> Baixar catálogo (PDF)
        </a>
      </section>

      <CatalogGrid />
    </div>
  );
}
