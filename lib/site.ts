/** Configurações da loja Flora Mattos. */

/** Link do catálogo no WhatsApp (botão "Ver na loja"). */
export const STORE_URL = "https://wa.me/c/5512988050872";

/** Domínio do site (sem protocolo) — usado no rodapé dos panfletos/PDF. */
export const SITE_DOMAIN = "catalogo-floramattos.vercel.app";

/** Telefone para contato direto (wa.me com mensagem). */
export const WHATSAPP_PHONE = "5512988050872";

/** Monta um link de conversa no WhatsApp com mensagem opcional. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_PHONE}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Mensagem padrão de interesse por uma planta (e tamanho, se houver). */
export function mensagemInteresse(nome: string, tamanho?: string) {
  const tam = tamanho && tamanho !== "Único" ? ` no tamanho ${tamanho}` : "";
  return `Olá! Tenho interesse no(a) *${nome}*${tam}. Ainda está disponível?`;
}

export type Tamanho = {
  tamanho: string;
  preco: string;
  precoDe: string;
  situacao: string;
};

/** Converte "1.290,00" -> 1290.0; retorna null se vazio/inválido. */
export function parsePreco(v?: string | null): number | null {
  if (!v) return null;
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Resumo de preço para exibir no card: menor preço entre os tamanhos. */
export function resumoPreco(tamanhos: readonly Tamanho[]) {
  const precos = tamanhos
    .map((t) => parsePreco(t.preco))
    .filter((n): n is number => n !== null);
  if (precos.length === 0) return { texto: "Consultar", aPartirDe: false };
  const min = Math.min(...precos);
  const texto = `R$ ${min.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
  return { texto, aPartirDe: precos.length > 1 };
}
