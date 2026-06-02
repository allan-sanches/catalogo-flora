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

export const dynamic = "force-dynamic";

const VERDE = "#1B4332";
const VERDE_CLARO = "#5C7D63";
const BEGE = "#D9C7A7";
const BEGE_CLARO = "#EDE3D2";
const CREME = "#FBF8F2";
const CINZA = "#4B5563";

const s = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 44,
    fontSize: 9,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  // capa
  cover: { padding: 0, backgroundColor: BEGE_CLARO },
  coverBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
  },
  brandName: { fontSize: 40, color: VERDE, fontFamily: "Helvetica-Bold", marginTop: 18 },
  brandSub: {
    fontSize: 13,
    letterSpacing: 6,
    color: VERDE_CLARO,
    textTransform: "uppercase",
    marginTop: 4,
  },
  rule: { width: 90, height: 2, backgroundColor: VERDE_CLARO, marginVertical: 26 },
  coverTitle: { fontSize: 22, color: VERDE, fontFamily: "Helvetica-Bold" },
  coverMeta: { fontSize: 11, color: CINZA, marginTop: 10 },
  // índice
  h1: { fontSize: 20, color: VERDE, fontFamily: "Helvetica-Bold", marginBottom: 14 },
  idxFam: {
    fontSize: 13,
    color: VERDE,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    marginBottom: 2,
  },
  idxGen: { fontSize: 10, color: VERDE_CLARO, fontFamily: "Helvetica-Bold", marginTop: 6 },
  idxItem: { fontSize: 9, color: CINZA, marginLeft: 10, marginTop: 1.5 },
  // entradas
  famHeader: {
    fontSize: 18,
    color: CREME,
    backgroundColor: VERDE,
    fontFamily: "Helvetica-Bold",
    padding: "8px 12px",
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 6,
  },
  genHeader: {
    fontSize: 13,
    color: VERDE,
    fontFamily: "Helvetica-Oblique",
    marginTop: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BEGE,
    paddingBottom: 3,
  },
  card: {
    flexDirection: "row",
    gap: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E7E1D4",
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  thumb: { width: 78, height: 78, borderRadius: 6, objectFit: "cover" },
  thumbPh: {
    width: 78,
    height: 78,
    borderRadius: 6,
    backgroundColor: BEGE_CLARO,
    alignItems: "center",
    justifyContent: "center",
  },
  nome: { fontSize: 12, color: "#111827", fontFamily: "Helvetica-Bold" },
  cient: { fontSize: 9.5, color: CINZA, fontStyle: "italic", marginTop: 1 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 },
  tag: {
    fontSize: 7.5,
    color: VERDE,
    backgroundColor: BEGE_CLARO,
    padding: "2px 5px",
    borderRadius: 3,
  },
  dist: { fontSize: 8, color: "#6B7280", marginTop: 5 },
  fonte: { fontSize: 7, color: "#9CA3AF", marginTop: 3, fontStyle: "italic" },
  preco: { fontSize: 11, color: VERDE, fontFamily: "Helvetica-Bold", marginTop: 5 },
  header: {
    position: "absolute",
    top: 20,
    left: 44,
    right: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: VERDE_CLARO,
  },
  footer: {
    position: "absolute",
    bottom: 22,
    left: 44,
    right: 44,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

const LEAF =
  "M32 4c-2 9-9 13-17 15 2 1 4 3 5 5-6 1-11 5-14 11 8 1 14-1 19-5-1 6-4 11-9 15 8 0 14-4 18-11 1 8 1 14-2 21 6-4 9-11 9-19 4 6 6 13 5 21 5-6 7-13 6-21 4 3 9 4 15 4-3-6-8-10-14-12 2-2 4-4 7-5-8-2-14-7-16-15-5 4-9 9-12 16-2-6-2-12-0-19z";

function Leaf({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path d={LEAF} fill={VERDE} />
    </Svg>
  );
}

function precoResumo(tamanhos: { preco: string }[]) {
  const nums = tamanhos
    .map((t) => Number((t.preco || "").replace(/\./g, "").replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 0) return "Consultar";
  const min = Math.min(...nums);
  const txt = `R$ ${min.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  return nums.length > 1 ? `a partir de ${txt}` : txt;
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const [plantas, marca] = await Promise.all([getPlantas(), getMarca()]);
  const data = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // agrupa: família -> gênero -> plantas
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
        .map(([g, lista]) => ({
          genero: g,
          lista: [...lista].sort((a, b) =>
            a.nomeComum.localeCompare(b.nomeComum, "pt-BR")
          ),
        }))
        .sort((a, b) => a.genero.localeCompare(b.genero, "pt-BR")),
    }))
    .sort((a, b) => a.familia.localeCompare(b.familia, "pt-BR"));

  const logoSrc = marca.logoUrl ? `${origin}${marca.logoUrl}` : null;

  const doc = (
    <Document title={`Catálogo ${marca.nome}`} author={marca.nome}>
      {/* CAPA */}
      <Page size="A4" style={s.cover}>
        <View style={s.coverBox}>
          {logoSrc ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={logoSrc} style={{ width: 130, height: 130, objectFit: "contain" }} />
          ) : (
            <Leaf size={96} />
          )}
          <Text style={s.brandName}>{marca.nome}</Text>
          <Text style={s.brandSub}>{marca.subtitulo}</Text>
          <View style={s.rule} />
          <Text style={s.coverTitle}>Catálogo de Plantas</Text>
          <Text style={s.coverMeta}>
            {plantas.length} plantas · {familias.length} família(s)
          </Text>
          <Text style={s.coverMeta}>Atualizado em {data}</Text>
          <Text style={[s.coverMeta, { fontSize: 8, marginTop: 16, maxWidth: 360, textAlign: "center" }]}>
            Dados botânicos verificados na Flora e Funga do Brasil (JBRJ),
            POWO/Kew e aroid.org.
          </Text>
        </View>
      </Page>

      {/* ÍNDICE */}
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <Text>{marca.nome}</Text>
          <Text>Índice</Text>
        </View>
        <Text style={s.h1}>Índice</Text>
        {familias.map((f) => (
          <View key={f.familia} wrap={false}>
            <Text style={s.idxFam}>{f.familia}</Text>
            {f.generos.map((g) => (
              <View key={g.genero}>
                <Text style={s.idxGen}>
                  {g.genero} ({g.lista.length})
                </Text>
                {g.lista.map((p) => (
                  <Text key={p.slug} style={s.idxItem}>
                    • {p.nomeComum} — {p.nomeCientifico}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <Text style={s.footer} fixed render={({ pageNumber }) => `${pageNumber}`} />
      </Page>

      {/* ENTRADAS */}
      <Page size="A4" style={s.page} wrap>
        <View style={s.header} fixed>
          <Text>{marca.nome}</Text>
          <Text>Catálogo · {data}</Text>
        </View>

        {familias.map((f) => (
          <View key={f.familia}>
            <Text style={s.famHeader}>{f.familia}</Text>
            {f.generos.map((g) => (
              <View key={g.genero}>
                <Text style={s.genHeader}>{g.genero}</Text>
                {g.lista.map((p) => (
                  <View key={p.slug} style={s.card} wrap={false}>
                    {p.imagem ? (
                      // eslint-disable-next-line jsx-a11y/alt-text
                      <Image src={`${origin}${p.imagem}`} style={s.thumb} />
                    ) : (
                      <View style={s.thumbPh}>
                        <Leaf size={36} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.nome}>{p.nomeComum}</Text>
                      <Text style={s.cient}>
                        {p.nomeCientifico}
                        {p.autor ? ` ${p.autor}` : ""}
                      </Text>
                      <View style={s.tagRow}>
                        {p.origem ? <Text style={s.tag}>{p.origem}</Text> : null}
                        {(p.luminosidade || []).map((l) => (
                          <Text key={l} style={s.tag}>
                            {l}
                          </Text>
                        ))}
                        {p.formaVida ? <Text style={s.tag}>{p.formaVida}</Text> : null}
                        {p.toxica ? <Text style={s.tag}>Tóxica</Text> : null}
                      </View>
                      {p.distribuicao ? (
                        <Text style={s.dist}>{p.distribuicao}</Text>
                      ) : null}
                      {p.fonte ? (
                        <Text style={s.fonte}>Fonte: {p.fonte}</Text>
                      ) : null}
                      <Text style={s.preco}>{precoResumo([...p.tamanhos])}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ))}

        <Text
          style={s.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `${marca.nome} · ${marca.subtitulo} — página ${pageNumber} de ${totalPages}`
          }
        />
      </Page>
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
