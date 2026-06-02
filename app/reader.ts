import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";

export const reader = createReader(process.cwd(), keystaticConfig);

export type PlantaEntry = Awaited<
  ReturnType<typeof reader.collections.plantas.read>
>;

export type Marca = {
  logoUrl: string | null;
  nome: string;
  subtitulo: string;
};

/** Lê a configuração da marca (logo/nome/subtítulo) com valores padrão. */
export async function getMarca(): Promise<Marca> {
  const m = await reader.singletons.marca.read();
  return {
    logoUrl: m?.logo ?? null,
    nome: m?.nome?.trim() || "Flora Mattos",
    subtitulo: m?.subtitulo?.trim() || "Cultivo Afetivo",
  };
}

/** Lê todas as plantas com o conteúdo já resolvido e ordenadas por nome. */
export async function getPlantas() {
  const slugs = await reader.collections.plantas.all();
  return slugs
    .map((p) => ({ slug: p.slug, ...p.entry }))
    .sort((a, b) =>
      a.nomeComum.localeCompare(b.nomeComum, "pt-BR", { sensitivity: "base" })
    );
}
