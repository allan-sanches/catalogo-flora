import { getPlantas, getMarca } from "../reader";
import { CatalogProvider, type CatalogItem } from "@/components/CatalogProvider";
import SiteShell from "@/components/SiteShell";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [plantas, marca] = await Promise.all([getPlantas(), getMarca()]);

  const items: CatalogItem[] = plantas.map((p) => ({
    slug: p.slug,
    nomeComum: p.nomeComum,
    nomeCientifico: p.nomeCientifico,
    familia: p.familia,
    genero: p.genero,
    especie: p.especie,
    origem: p.origem,
    formaVida: p.formaVida,
    luminosidade: [...p.luminosidade],
    imagem: p.imagem ?? null,
    tamanhos: p.tamanhos.map((t) => ({
      tamanho: t.tamanho,
      preco: t.preco,
      precoDe: t.precoDe,
      situacao: t.situacao,
    })),
  }));

  return (
    <CatalogProvider items={items}>
      <SiteShell marca={marca}>{children}</SiteShell>
    </CatalogProvider>
  );
}
