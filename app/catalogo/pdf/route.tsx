import {
  Document,
  Page,
  Text,
  View,
  Image,
  Svg,
  Path,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { getPlantas, getMarca } from "../../reader";
import { localImageDataUri } from "@/lib/serverImage";

export const dynamic = "force-dynamic";

const VERDE = "#1B4332";
const VERDE_CLARO = "#5C7D63";
const BEGE = "#D9C7A7";
const BEGE_CLARO = "#EDE3D2";
const CREME = "#FBF8F2";
const CINZA = "#4B5563";

const s = StyleSheet.create({
  // capa
  cover: { padding: 0, backgroundColor: BEGE_CLARO },
  coverBox: { flex: 1, alignItems: "center", justifyContent: "center", padding: 60 },
  brandName: { fontSize: 40, color: VERDE, fontFamily: "Helvetica-Bold", marginTop: 18 },
  brandSub: { fontSize: 13, letterSpacing: 6, color: VERDE_CLARO, textTransform: "uppercase", marginTop: 4 },
  rule: { width: 90, height: 2, backgroundColor: VERDE_CLARO, marginVertical: 26 },
  coverTitle: { fontSize: 22, color: VERDE, fontFamily: "Helvetica-Bold" },
  coverMeta: { fontSize: 11, color: CINZA, marginTop: 10 },

  // índice
  page: { paddingTop: 54, paddingBottom: 56, paddingHorizontal: 44, fontSize: 9, color: "#1f2937", fontFamily: "Helvetica" },
  h1: { fontSize: 20, color: VERDE, fontFamily: "Helvetica-Bold", marginBottom: 14 },
  idxFam: { fontSize: 13, color: VERDE, fontFamily: "Helvetica-Bold", marginTop: 12, marginBottom: 2 },
  idxGen: { fontSize: 10, color: VERDE_CLARO, fontFamily: "Helvetica-Bold", marginTop: 6 },
  idxItem: { fontSize: 9, color: CINZA, marginLeft: 10, marginTop: 1.5 },

  // post (1 planta por página)
  post: { paddingTop: 0, paddingBottom: 46, paddingHorizontal: 0, fontFamily: "Helvetica", color: "#1f2937", backgroundColor: CREME },
  topbar: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: VERDE, paddingVertical: 14, paddingHorizontal: 34 },
  topbarName: { fontSize: 15, color: CREME, fontFamily: "Helvetica-Bold" },
  topbarSub: { fontSize: 8, color: BEGE, letterSpacing: 2, textTransform: "uppercase" },
  hero: { width: "100%", height: 300, objectFit: "cover", backgroundColor: BEGE_CLARO },
  heroPh: { width: "100%", height: 300, backgroundColor: BEGE_CLARO, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  nome: { fontSize: 26, color: VERDE, fontFamily: "Helvetica-Bold" },
  cient: { fontSize: 13, color: CINZA, fontStyle: "italic", marginTop: 2 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 12 },
  badge: { fontSize: 9, color: VERDE, backgroundColor: BEGE_CLARO, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  badgeWarn: { fontSize: 9, color: "#7c2d12", backgroundColor: "#fde68a", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10 },
  desc: { fontSize: 11.5, lineHeight: 1.5, color: "#374151", marginTop: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, borderTopWidth: 1, borderTopColor: BEGE },
  cell: { width: "50%", paddingVertical: 6, paddingRight: 10 },
  cellLabel: { fontSize: 8, color: VERDE_CLARO, textTransform: "uppercase", letterSpacing: 1 },
  cellValue: { fontSize: 11, color: "#1f2937", marginTop: 1 },
  precoTitle: { fontSize: 9, color: VERDE_CLARO, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 4 },
  precoRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 3 },
  precoTam: { fontSize: 9, color: VERDE, backgroundColor: BEGE_CLARO, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8, fontFamily: "Helvetica-Bold" },
  precoVal: { fontSize: 12, color: VERDE, fontFamily: "Helvetica-Bold" },
  precoDe: { fontSize: 9, color: "#9CA3AF", textDecoration: "line-through" },
  fonte: { fontSize: 8, color: "#9CA3AF", fontStyle: "italic", marginTop: 16 },

  footer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#9CA3AF" },
  headerFix: { position: "absolute", top: 20, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: VERDE_CLARO },
});

const LEAF =
  "M32 4c-2 9-9 13-17 15 2 1 4 3 5 5-6 1-11 5-14 11 8 1 14-1 19-5-1 6-4 11-9 15 8 0 14-4 18-11 1 8 1 14-2 21 6-4 9-11 9-19 4 6 6 13 5 21 5-6 7-13 6-21 4 3 9 4 15 4-3-6-8-10-14-12 2-2 4-4 7-5-8-2-14-7-16-15-5 4-9 9-12 16-2-6-2-12-0-19z";

function Leaf({ size, color = VERDE }: { size: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d={LEAF} fill={color} />
    </Svg>
  );
}

function parsePreco(v: string) {
  const n = Number((v || "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Extrai texto puro do nó Markdoc da descrição.
function nodeToText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { attributes?: { content?: unknown }; children?: unknown[] };
  let out = "";
  if (typeof n.attributes?.content === "string") out += n.attributes.content;
  if (Array.isArray(n.children)) for (const c of n.children) out += nodeToText(c) + " ";
  return out;
}

export async function GET() {
  const [plantas, marca] = await Promise.all([getPlantas(), getMarca()]);
  const data = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  // pré-carrega imagens (data URI) — evita depender de HTTP na Vercel
  const fotos: Record<string, string | null> = {};
  await Promise.all(
    plantas.map(async (p) => {
      fotos[p.slug] = await localImageDataUri(p.imagem);
    })
  );
  const logoData = await localImageDataUri(marca.logoUrl);

  // pré-carrega as descrições (texto puro do Markdoc)
  const descricoes: Record<string, string> = {};
  await Promise.all(
    plantas.map(async (p) => {
      try {
        const { node } = await (p as { descricao: () => Promise<{ node: unknown }> }).descricao();
        descricoes[p.slug] = nodeToText(node).replace(/\s+/g, " ").trim();
      } catch {
        descricoes[p.slug] = "";
      }
    })
  );

  // índice: família -> gênero
  const fam = new Map<string, Map<string, typeof plantas>>();
  for (const p of plantas) {
    const f = p.familia?.trim() || "Outros";
    const g = p.genero?.trim() || "Outros";
    if (!fam.has(f)) fam.set(f, new Map());
    const gmap = fam.get(f)!;
    if (!gmap.has(g)) gmap.set(g, []);
    gmap.get(g)!.push(p);
  }
  const familias = [...fam.entries()]
    .map(([f, gmap]) => ({
      familia: f,
      generos: [...gmap.entries()]
        .map(([g, lista]) => ({ genero: g, lista: [...lista].sort((a, b) => a.nomeComum.localeCompare(b.nomeComum, "pt-BR")) }))
        .sort((a, b) => a.genero.localeCompare(b.genero, "pt-BR")),
    }))
    .sort((a, b) => a.familia.localeCompare(b.familia, "pt-BR"));

  // ordem dos posts: por família, gênero, nome
  const ordenadas = familias.flatMap((f) => f.generos.flatMap((g) => g.lista));

  const Footer = () => (
    <Text style={s.footer} fixed render={({ pageNumber, totalPages }) => `${marca.nome} · ${marca.subtitulo}                                                                 ${pageNumber} / ${totalPages}`} />
  );

  const doc = (
    <Document title={`Catálogo ${marca.nome}`} author={marca.nome}>
      {/* CAPA */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverBox}>
          {logoData ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoData} style={{ width: 140, height: 140, objectFit: "contain" }} />
          ) : (
            <Leaf size={96} />
          )}
          <Text style={s.brandName}>{marca.nome}</Text>
          <Text style={s.brandSub}>{marca.subtitulo}</Text>
          <View style={s.rule} />
          <Text style={s.coverTitle}>Catálogo de Plantas</Text>
          <Text style={s.coverMeta}>{plantas.length} plantas · {familias.length} família(s)</Text>
          <Text style={s.coverMeta}>Atualizado em {data}</Text>
          <Text style={[s.coverMeta, { fontSize: 8, marginTop: 16, maxWidth: 360, textAlign: "center" }]}>
            Dados botânicos verificados na Flora e Funga do Brasil (JBRJ), POWO/Kew e aroid.org.
          </Text>
        </View>
        <Footer />
      </Page>

      {/* ÍNDICE */}
      <Page size="A4" style={s.page}>
        <View style={s.headerFix} fixed>
          <Text>{marca.nome}</Text>
          <Text>Índice</Text>
        </View>
        <Text style={s.h1}>Índice</Text>
        {familias.map((f) => (
          <View key={f.familia} wrap={false}>
            <Text style={s.idxFam}>{f.familia}</Text>
            {f.generos.map((g) => (
              <View key={g.genero}>
                <Text style={s.idxGen}>{g.genero} ({g.lista.length})</Text>
                {g.lista.map((p) => (
                  <Text key={p.slug} style={s.idxItem}>• {p.nomeComum} — {p.nomeCientifico}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <Footer />
      </Page>

      {/* UM POST POR PLANTA */}
      {ordenadas.map((p) => {
        const foto = fotos[p.slug];
        const tamanhos = [...p.tamanhos];
        return (
          <Page key={p.slug} size="A4" style={s.post}>
            <View style={s.topbar}>
              {logoData ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={logoData} style={{ width: 26, height: 26, objectFit: "contain" }} />
              ) : (
                <Leaf size={22} color={CREME} />
              )}
              <View>
                <Text style={s.topbarName}>{marca.nome}</Text>
                <Text style={s.topbarSub}>{marca.subtitulo}</Text>
              </View>
            </View>

            {foto ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={foto} style={s.hero} />
            ) : (
              <View style={s.heroPh}>
                <Leaf size={72} color={VERDE_CLARO} />
              </View>
            )}

            <View style={s.body}>
              <Text style={s.nome}>{p.nomeComum}</Text>
              <Text style={s.cient}>
                {p.nomeCientifico}{p.autor ? ` ${p.autor}` : ""}
              </Text>

              <View style={s.badges}>
                <Text style={s.badge}>{p.familia}</Text>
                {p.origem ? <Text style={s.badge}>{p.origem}</Text> : null}
                {(p.luminosidade || []).map((l) => (
                  <Text key={l} style={s.badge}>{l}</Text>
                ))}
                {p.formaVida ? <Text style={s.badge}>{p.formaVida}</Text> : null}
                {p.toxica ? <Text style={s.badgeWarn}>Tóxica</Text> : null}
              </View>

              {descricoes[p.slug] ? <Text style={s.desc}>{descricoes[p.slug]}</Text> : null}

              <View style={s.grid}>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Gênero / Espécie</Text>
                  <Text style={s.cellValue}>{p.genero} {p.especie}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Origem</Text>
                  <Text style={s.cellValue}>{p.origem || "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Distribuição</Text>
                  <Text style={s.cellValue}>{p.distribuicao || "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Luminosidade</Text>
                  <Text style={s.cellValue}>{(p.luminosidade || []).join(", ") || "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Substrato</Text>
                  <Text style={s.cellValue}>{(p.substrato || []).join(", ") || "—"}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>Rega</Text>
                  <Text style={s.cellValue}>{p.rega || "—"}</Text>
                </View>
              </View>

              <Text style={s.precoTitle}>Tamanhos e preços</Text>
              {tamanhos.length === 0 ? (
                <Text style={s.cellValue}>Consultar</Text>
              ) : (
                tamanhos.map((t, i) => {
                  const v = parsePreco(t.preco);
                  return (
                    <View key={i} style={s.precoRow}>
                      <Text style={s.precoTam}>{t.tamanho}</Text>
                      <Text style={s.precoVal}>
                        {v ? `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "Consultar"}
                      </Text>
                      {t.precoDe ? <Text style={s.precoDe}>R$ {t.precoDe}</Text> : null}
                    </View>
                  );
                })
              )}

              {p.fonte ? <Text style={s.fonte}>Fonte: {p.fonte}</Text> : null}
            </View>

            <Footer />
          </Page>
        );
      })}
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="catalogo-flora-mattos.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
