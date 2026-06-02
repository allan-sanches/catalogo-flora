import { ImageResponse } from "next/og";
import { reader, getMarca } from "../../reader";

export const dynamic = "force-dynamic";

const VERDE = "#1B4332";
const VERDE_CLARO = "#5C7D63";
const BEGE = "#EDE3D2";
const CREME = "#FBF8F2";

// Extrai texto puro do nó Markdoc da descrição.
function nodeToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { attributes?: { content?: unknown }; children?: unknown[] };
  let out = "";
  if (typeof n.attributes?.content === "string") out += n.attributes.content;
  if (Array.isArray(n.children))
    for (const c of n.children) out += nodeToText(c);
  return out;
}

async function loadFont(
  family: string,
  weight: number
): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family
    )}:wght@${weight}`;
    const css = await (
      await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } })
    ).text();
    const m = css.match(/src: url\((https:\/\/[^)]+?)\) format\('(truetype|opentype)'\)/);
    if (!m) return null;
    return await (await fetch(m[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const [planta, marca] = await Promise.all([
    reader.collections.plantas.read(slug),
    getMarca(),
  ]);

  if (!planta) return new Response("Planta não encontrada", { status: 404 });

  const url = new URL(request.url);
  const origin = url.origin;
  const formato = url.searchParams.get("f") === "feed" ? "feed" : "story";
  const W = 1080;
  const H = formato === "feed" ? 1350 : 1920;

  const foto = planta.imagem ? `${origin}${planta.imagem}` : null;
  const { node } = await planta.descricao();
  let descricao = nodeToText(node).replace(/\s+/g, " ").trim();
  const limite = formato === "feed" ? 150 : 230;
  if (descricao.length > limite) descricao = descricao.slice(0, limite - 1) + "…";

  const luz = (planta.luminosidade ?? []).join(", ") || "—";
  const fonte = (planta.fonte ?? "").trim();

  const [lora, monts] = await Promise.all([loadFont("Lora", 600), loadFont("Montserrat Alternates", 500)]);
  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }[] = [];
  if (lora) fonts.push({ name: "Lora", data: lora, weight: 600, style: "normal" });
  if (monts) fonts.push({ name: "Montserrat", data: monts, weight: 400, style: "normal" });

  const titleFont = lora ? "Lora" : "serif";
  const bodyFont = monts ? "Montserrat" : "sans-serif";

  const fotoH = formato === "feed" ? 620 : 980;

  function Info({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span
          style={{
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: VERDE_CLARO,
            fontFamily: bodyFont,
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 30, color: VERDE, fontFamily: titleFont }}>
          {value}
        </span>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          backgroundColor: CREME,
          fontFamily: bodyFont,
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: VERDE,
            color: CREME,
            padding: "44px 56px",
          }}
        >
          <span style={{ fontSize: 52, fontFamily: titleFont }}>{marca.nome}</span>
          <span
            style={{
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: BEGE,
            }}
          >
            {marca.subtitulo}
          </span>
        </div>

        {/* Foto */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: fotoH,
            backgroundColor: BEGE,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              width={W}
              height={fotoH}
              style={{ width: W, height: fotoH, objectFit: "cover" }}
              alt=""
            />
          ) : (
            <span style={{ fontSize: 200 }}>🌿</span>
          )}
        </div>

        {/* Conteúdo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "48px 56px",
          }}
        >
          <span style={{ fontSize: 60, lineHeight: 1.05, color: VERDE, fontFamily: titleFont }}>
            {planta.nomeComum}
          </span>
          <span style={{ fontSize: 34, fontStyle: "italic", color: "#6B7280", marginTop: 6 }}>
            {planta.nomeCientifico}
          </span>

          {descricao && (
            <span style={{ fontSize: 30, lineHeight: 1.45, color: "#374151", marginTop: 26 }}>
              {descricao}
            </span>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 40,
              paddingTop: 32,
              borderTop: `3px solid ${BEGE}`,
            }}
          >
            <Info label="Família" value={planta.familia || "—"} />
            <Info label="Origem" value={planta.origem || "—"} />
            <Info label="Luz" value={luz} />
          </div>

          {fonte && (
            <span style={{ fontSize: 18, color: "#9CA3AF", marginTop: 18 }}>
              Fonte: {fonte}
            </span>
          )}
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: VERDE,
            color: CREME,
            fontSize: 26,
            padding: "26px 0",
          }}
        >
          🌱 Peça pelo WhatsApp · {marca.nome}
        </div>
      </div>
    ),
    { width: W, height: H, fonts: fonts.length ? fonts : undefined }
  );
}
