import Link from "next/link";
import Image from "next/image";

export type Marca = {
  logoUrl: string | null;
  logoHorizontalUrl: string | null;
  nome: string;
  subtitulo: string;
};

const FALLBACK: Marca = {
  logoUrl: null,
  logoHorizontalUrl: null,
  nome: "Flora Mattos",
  subtitulo: "Cultivo Afetivo",
};

/**
 * Marca no topo/sidebar do site.
 * Prefere o logo horizontal (já contém o nome) e mostra só a imagem.
 * Sem logo cadastrado, cai no SVG da folha + wordmark.
 */
export default function Logo({
  marca = FALLBACK,
  compact = false,
}: {
  marca?: Marca;
  compact?: boolean;
}) {
  const { logoHorizontalUrl, nome, subtitulo } = marca;

  if (logoHorizontalUrl) {
    return (
      <Link href="/" aria-label={`${nome} — início`} className="flex items-center">
        <Image
          src={logoHorizontalUrl}
          alt={nome}
          width={220}
          height={72}
          priority
          className="h-11 w-auto object-contain"
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${nome} — início`}>
      <svg
        viewBox="0 0 64 64"
        className="h-10 w-10 shrink-0 text-primary"
        fill="currentColor"
        aria-hidden
      >
        <path d="M32 4c-2 9-9 13-17 15 2 1 4 3 5 5-6 1-11 5-14 11 8 1 14-1 19-5-1 6-4 11-9 15 8 0 14-4 18-11 1 8 1 14-2 21 6-4 9-11 9-19 4 6 6 13 5 21 5-6 7-13 6-21 4 3 9 4 15 4-3-6-8-10-14-12 2-2 4-4 7-5-8-2-14-7-16-15-5 4-9 9-12 16-2-6-2-12-0-19z" />
      </svg>
      <span className="leading-tight">
        <span className="font-title block text-xl font-semibold text-primary">{nome}</span>
        {!compact && (
          <span className="block text-xs uppercase tracking-[0.2em] text-primary/70">
            {subtitulo}
          </span>
        )}
      </span>
    </Link>
  );
}
