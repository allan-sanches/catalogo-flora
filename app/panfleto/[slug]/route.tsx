import { ImageResponse } from "next/og";
import { reader, getMarca } from "../../reader";
import { localImageDataUri } from "@/lib/serverImage";
import { STORE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const VERDE = "#1B4332";
const VERDE_CLARO = "#5C7D63";
const BEGE = "#D9C7A7";
const BEGE_CLARO = "#EDE3D2";
const CREME = "#FBF8F2";

function nodeToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { attributes?: { content?: unknown }; children?: unknown[] };
  let out = "";
  if (typeof n.attributes?.content === "string") out += n.attributes.content;
  if (Array.isArray(n.children)) for (const c of n.children) out += nodeToText(c) + " ";
  return out;
}

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
    const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } })).text();
    const m = css.match(/src: url\((https:\/\/[^)]+?)\) format\('(truetype|opentype)'\)/);
    if (!m) return null;
    return await (await fetch(m[1])).arrayBuffer();
  } catch {
    return null;
  }
}

// Ícones (SVG) para a linha de atributos
function LeafIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth={1.8}>
      <path d="M11 20C6 20 3 16 3 11c5 0 8 1 9 3" />
      <path d="M11 20c0-7 3-12 9-15 0 9-3 15-9 15z" />
    </svg>
  );
}
function PinIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth={1.8}>
      <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.6" />
    </svg>
  );
}
function SunIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={VERDE} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 7 a5 5 0 0 1 0 10 z" fill={VERDE} stroke="none" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </svg>
  );
}

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const [planta, marca] = await Promise.all([reader.collections.plantas.read(slug), getMarca()]);
  if (!planta) return new Response("Planta não encontrada", { status: 404 });

  const url = new URL(request.url);
  const origin = url.origin;
  const formato = url.searchParams.get("f") === "feed" ? "feed" : "story";
  const comPreco = ["1", "true", "sim"].includes(
    (url.searchParams.get("preco") || "").toLowerCase()
  );
  const logoOri = url.searchParams.get("logo") === "horizontal" ? "horizontal" : "vertical";
  const W = 1080;
  const H = formato === "feed" ? 1350 : 1920;

  const principal =
    (await localImageDataUri(planta.imagem)) ?? (planta.imagem ? `${origin}${planta.imagem}` : null);
  const detalhe =
    (await localImageDataUri(planta.imagemPadrao)) ??
    (planta.imagemPadrao ? `${origin}${planta.imagemPadrao}` : null) ??
    principal;
  const [logoV, logoH] = await Promise.all([
    localImageDataUri(marca.logoUrl),
    localImageDataUri(marca.logoHorizontalUrl),
  ]);
  const logo = logoOri === "horizontal" ? logoH ?? logoV : logoV ?? logoH;
  const logoBox = logoOri === "horizontal" ? { w: 300, h: 110 } : { w: 190, h: 190 };

  const { node } = await planta.descricao();
  let descricao = nodeToText(node).replace(/\s+/g, " ").trim();
  const limite = formato === "feed" ? 150 : 240;
  if (descricao.length > limite) descricao = descricao.slice(0, limite - 1) + "…";

  const luz = (planta.luminosidade ?? []).join(", ") || "—";
  const fonte = (planta.fonte ?? "").trim();
  const linkLoja = STORE_URL.replace(/^https?:\/\//, "");

  const fmtPreco = (v: string) => {
    const n = Number((v || "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) && n > 0
      ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} + frete`
      : null;
  };
  const precos = (planta.tamanhos ?? [])
    .map((t) => ({ tam: t.tamanho, txt: fmtPreco(t.preco) }))
    .filter((p) => p.txt);

  const [lora, monts] = await Promise.all([loadFont("Lora", 600), loadFont("Montserrat Alternates", 500)]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[] = [];
  if (lora) fonts.push({ name: "Lora", data: lora, weight: 600, style: "normal" });
  if (monts) fonts.push({ name: "Montserrat", data: monts, weight: 400, style: "normal" });
  const titleFont = lora ? "Lora" : "serif";
  const bodyFont = monts ? "Montserrat" : "sans-serif";

  const photoH = formato === "feed" ? 760 : 1040;
  const circle = formato === "feed" ? 380 : 460;

  function Attr({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span style={{ fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: VERDE_CLARO, fontFamily: bodyFont }}>
            {label}
          </span>
        </div>
        <span style={{ fontSize: 30, color: VERDE, fontFamily: titleFont }}>{value}</span>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", flexDirection: "column", backgroundColor: CREME, fontFamily: bodyFont }}>
        {/* Palco da foto */}
        <div style={{ display: "flex", position: "relative", width: W, height: photoH, backgroundColor: BEGE_CLARO, alignItems: "center", justifyContent: "center" }}>
          {principal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={principal} width={W} height={photoH} style={{ width: W, height: photoH, objectFit: "contain" }} alt="" />
          ) : (
            <div style={{ display: "flex", fontSize: 200 }}>🌿</div>
          )}

          {/* Card do logo (canto superior esquerdo) — só o logo */}
          <div
            style={{
              position: "absolute",
              top: 30,
              left: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: CREME,
              borderRadius: 24,
              padding: 22,
              boxShadow: "0 18px 40px rgba(0,0,0,0.22)",
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                width={logoBox.w}
                height={logoBox.h}
                style={{ width: logoBox.w, height: logoBox.h, objectFit: "contain" }}
                alt=""
              />
            ) : (
              <span style={{ fontSize: 64 }}>🌿</span>
            )}
          </div>

          {/* Círculo de detalhe (canto inferior direito da foto) */}
          {detalhe ? (
            <div
              style={{
                position: "absolute",
                bottom: 28,
                right: 28,
                width: circle,
                height: circle,
                borderRadius: circle,
                border: `6px solid ${CREME}`,
                overflow: "hidden",
                display: "flex",
                boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={detalhe} width={circle} height={circle} style={{ width: circle, height: circle, objectFit: "cover" }} alt="" />
            </div>
          ) : null}
        </div>

        {/* Painel de informações */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "-56px 28px 0 28px",
            backgroundColor: CREME,
            borderRadius: 28,
            padding: "40px 44px",
            boxShadow: "0 -6px 24px rgba(0,0,0,0.06)",
          }}
        >
          <span style={{ fontSize: 60, lineHeight: 1.05, color: VERDE, fontFamily: titleFont }}>{planta.nomeComum}</span>
          <span style={{ fontSize: 32, fontStyle: "italic", color: "#6B7280", marginTop: 4 }}>{planta.nomeCientifico}</span>
          {descricao ? (
            <span style={{ fontSize: 29, lineHeight: 1.45, color: "#374151", marginTop: 22 }}>{descricao}</span>
          ) : null}

          <div style={{ display: "flex", flexDirection: "row", gap: 16, marginTop: 30, paddingTop: 26, borderTop: `2px solid ${BEGE}` }}>
            <Attr icon={<LeafIcon />} label="Família" value={planta.familia || "—"} />
            <Attr icon={<PinIcon />} label="Origem" value={planta.origem || "—"} />
            <Attr icon={<SunIcon />} label="Luz" value={luz} />
          </div>

          {comPreco && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 24, paddingTop: 22, borderTop: `2px solid ${BEGE}` }}>
              <span style={{ fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: VERDE_CLARO }}>
                {precos.length > 1 ? "Tamanhos e preços" : "Preço"}
              </span>
              {precos.length === 0 ? (
                <span style={{ fontSize: 34, color: VERDE, fontFamily: titleFont }}>Sob consulta</span>
              ) : (
                precos.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    {p.tam && p.tam !== "Único" ? (
                      <span style={{ fontSize: 26, color: VERDE_CLARO, fontFamily: titleFont }}>{p.tam}</span>
                    ) : null}
                    <span style={{ fontSize: 38, color: VERDE, fontFamily: titleFont }}>{p.txt}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {fonte ? <span style={{ fontSize: 18, color: "#9CA3AF", marginTop: 18 }}>Fonte: {fonte}</span> : null}
        </div>

        {/* Espaço livre (sticker de link no Instagram) + rodapé */}
        <div style={{ display: "flex", flex: 1 }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: VERDE, color: CREME, paddingTop: 26, paddingBottom: 30 }}>
          <span style={{ fontSize: 38, letterSpacing: 3, textTransform: "uppercase", fontFamily: titleFont }}>🔗 Compre na loja</span>
          <span style={{ fontSize: 26, color: BEGE, marginTop: 6 }}>{linkLoja}</span>
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fonts.length ? fonts : undefined }
  );
}
