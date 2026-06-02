import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdoc from "@markdoc/markdoc";
import { reader } from "../../../reader";
import { markdocConfig } from "../../../../keystatic.config";
import { Megaphone } from "lucide-react";
import { LuzBadges, OrigemBadge, Badge } from "@/components/Badges";
import StoreButton from "@/components/StoreButton";
import { TabelaTamanhos } from "@/components/Precos";
import PanfletoControls from "@/components/PanfletoControls";

export async function generateStaticParams() {
  const slugs = await reader.collections.plantas.list();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const planta = await reader.collections.plantas.read(slug);
  if (!planta) return {};
  return {
    title: planta.nomeComum,
    description: `${planta.nomeCientifico} — ${planta.familia}`,
  };
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-base-200 py-2 last:border-0">
      <dt className="text-sm text-base-content/60">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function PlantaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const planta = await reader.collections.plantas.read(slug);
  if (!planta) notFound();

  const { node } = await planta.descricao();
  const errors = Markdoc.validate(node, markdocConfig);
  if (errors.length) console.error(errors);
  const renderable = Markdoc.transform(node, markdocConfig);
  const conteudo = Markdoc.renderers.react(renderable, React);

  return (
    <article className="space-y-8">
      <div className="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li>
            <Link href="/">Catálogo</Link>
          </li>
          <li>{planta.familia}</li>
          <li className="font-medium text-base-content">{planta.nomeComum}</li>
        </ul>
      </div>

      <header className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Fotos */}
        <div className="flex flex-col gap-2">
          <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-box bg-base-200 shadow-soft">
            {planta.imagem ? (
              <Image
                src={planta.imagem}
                alt={planta.nomeComum}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-7xl opacity-30">
                🌱
              </div>
            )}
            {planta.creditoImagem && (
              <figcaption className="absolute bottom-0 right-0 bg-base-100/80 px-2 py-0.5 text-[10px] text-base-content/60">
                {planta.creditoImagem}
              </figcaption>
            )}
          </figure>
          {planta.imagemPadrao && (
            <figure className="relative aspect-[16/9] w-full overflow-hidden rounded-box bg-base-200 shadow-soft">
              <Image
                src={planta.imagemPadrao}
                alt={`${planta.nomeComum} — foto secundária`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </figure>
          )}
        </div>

        {/* Cabeçalho + badges */}
        <div className="flex flex-col justify-center gap-3">
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              {planta.nomeComum}
            </h1>
            <p className="text-lg italic text-base-content/60">
              {planta.nomeCientifico}{" "}
              {planta.autor && (
                <span className="text-sm not-italic">{planta.autor}</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="badge-primary badge-outline">{planta.familia}</Badge>
            <OrigemBadge origem={planta.origem} />
            <LuzBadges luz={planta.luminosidade} />
            {planta.formaVida && (
              <Badge className="badge-ghost">{planta.formaVida}</Badge>
            )}
            {planta.toxica && (
              <Badge className="badge-error gap-1">⚠️ Tóxica</Badge>
            )}
          </div>

          <dl className="mt-2 panel px-4 py-2">
            <InfoRow label="Família" value={planta.familia} />
            <InfoRow label="Gênero" value={planta.genero} />
            <InfoRow label="Espécie" value={planta.especie} />
            <InfoRow label="Origem" value={planta.origem} />
            <InfoRow label="Distribuição" value={planta.distribuicao} />
            <InfoRow
              label="Luminosidade"
              value={planta.luminosidade.join(", ")}
            />
            <InfoRow label="Substrato" value={planta.substrato.join(", ")} />
            <InfoRow label="Rega" value={planta.rega} />
          </dl>

          <div className="mt-1 space-y-2">
            <TabelaTamanhos nome={planta.nomeComum} tamanhos={planta.tamanhos} />
            <StoreButton className="btn-sm btn-outline w-full" label="Ver catálogo completo na loja" />
          </div>
        </div>
      </header>

      {/* Descrição (conteúdo Markdoc/MDX) */}
      <section className="prose max-w-none prose-headings:text-base-content prose-p:text-base-content/80">
        {conteudo}
      </section>

      {/* Panfleto para redes sociais */}
      <section className="panel p-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h2 className="font-title text-lg font-semibold">Panfleto para redes</h2>
        </div>
        <p className="mt-1 text-sm text-base-content/60">
          Gere uma imagem pronta para publicar no Instagram. Escolha o formato, o
          logo e se quer incluir o preço (sempre exibido como “+ frete”).
        </p>

        <PanfletoControls slug={slug} />
      </section>

      {planta.fonte && (
        <p className="text-xs text-base-content/50">
          <span className="font-medium">Fonte dos dados:</span> {planta.fonte}.
          Verificado na Flora e Funga do Brasil (JBRJ), POWO/Kew e aroid.org.
        </p>
      )}
    </article>
  );
}
