import { resumoPreco, type Tamanho } from "@/lib/site";
import InterestButton from "./InterestButton";

/** Espaço reservado mostrado quando os preços estão ocultos. */
function Mascara({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`preco-mascarado items-center gap-1 text-base-content/40 ${
        small ? "text-sm" : ""
      }`}
    >
      <span className="tracking-widest">R$ ••••</span>
    </span>
  );
}

/** Resumo de preço usado no card da home. */
export function PrecoResumo({ tamanhos }: { tamanhos: readonly Tamanho[] }) {
  const { texto, aPartirDe } = resumoPreco(tamanhos);
  return (
    <p className="flex items-baseline gap-1">
      <span className="preco-valor items-baseline gap-1">
        {aPartirDe && (
          <span className="text-xs text-base-content/50">a partir de </span>
        )}
        <span className="font-title text-lg font-semibold text-primary">
          {texto}
        </span>
      </span>
      <Mascara />
    </p>
  );
}

/** Tabela de tamanhos + preços com botão de interesse, usada no detalhe. */
export function TabelaTamanhos({
  nome,
  tamanhos,
}: {
  nome: string;
  tamanhos: readonly Tamanho[];
}) {
  if (tamanhos.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3">
        <span className="font-title text-lg font-semibold text-base-content/60">
          Sob consulta
        </span>
        <InterestButton nome={nome} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-box border border-base-300 bg-base-100">
      <ul className="divide-y divide-base-200">
        {tamanhos.map((t, i) => (
          <li
            key={`${t.tamanho}-${i}`}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="badge badge-primary badge-outline">
                {t.tamanho}
              </span>
              {t.preco ? (
                <>
                  <span className="preco-valor items-baseline gap-2">
                    <span className="font-title text-lg font-semibold text-primary">
                      R$ {t.preco}
                    </span>
                    {t.precoDe && (
                      <span className="text-sm text-base-content/40 line-through">
                        R$ {t.precoDe}
                      </span>
                    )}
                  </span>
                  <Mascara />
                </>
              ) : (
                <span className="text-base-content/60">Consultar</span>
              )}
              {!t.disponivel && (
                <span className="badge badge-ghost badge-sm">Indisponível</span>
              )}
            </div>
            <InterestButton
              nome={nome}
              tamanho={t.tamanho}
              className="btn-sm"
              label="Tenho interesse"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
