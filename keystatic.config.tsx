import { config, fields, collection, singleton } from "@keystatic/core";

export const markdocConfig = {
  tags: {},
  nodes: {},
};

export default config({
  // Storage GitHub: edições pelo painel viram commits no repo.
  // O onboarding em /keystatic cria a GitHub App e gera as variáveis de ambiente.
  storage: { kind: "github", repo: "allan-sanches/catalogo-flora" },
  ui: {
    brand: { name: "Flora Mattos" },
  },
  collections: {
    plantas: collection({
      label: "Plantas",
      slugField: "nomeComum",
      path: "content/plantas/*",
      format: { contentField: "descricao" },
      columns: ["nomeComum", "nomeCientifico", "familia"],
      entryLayout: "content",
      schema: {
        nomeComum: fields.slug({
          name: { label: "Nome comum", description: "Ex.: Orelha-de-elefante" },
          slug: { label: "Slug (URL)" },
        }),
        nomeCientifico: fields.text({
          label: "Nome científico",
          description: "Ex.: Alocasia macrorrhizos",
        }),
        autor: fields.text({
          label: "Autor do nome",
          description: "Ex.: (L.) G.Don",
        }),
        familia: fields.text({ label: "Família", description: "Ex.: Araceae" }),
        genero: fields.text({ label: "Gênero", description: "Ex.: Alocasia" }),
        especie: fields.text({ label: "Espécie", description: "Ex.: macrorrhizos" }),
        imagem: fields.image({
          label: "Foto",
          description: "Foto principal da planta (faça upload aqui).",
          directory: "public/images/plantas",
          publicPath: "/images/plantas/",
        }),
        creditoImagem: fields.text({ label: "Crédito da foto" }),
        tamanhos: fields.array(
          fields.object({
            tamanho: fields.select({
              label: "Tamanho",
              options: [
                { label: "Único", value: "Único" },
                { label: "P (pequeno)", value: "P" },
                { label: "M (médio)", value: "M" },
                { label: "G (grande)", value: "G" },
              ],
              defaultValue: "Único",
            }),
            preco: fields.text({
              label: "Preço (R$)",
              description: "Apenas o valor, ex.: 85,00. Vazio = 'Consultar'.",
            }),
            precoDe: fields.text({
              label: "Preço 'de' (promoção)",
              description: "Valor antigo riscado, ex.: 120,00. Opcional.",
            }),
            disponivel: fields.checkbox({
              label: "Disponível",
              defaultValue: true,
            }),
          }),
          {
            label: "Tamanhos e preços",
            itemLabel: (props) =>
              `${props.fields.tamanho.value}${
                props.fields.preco.value ? ` — R$ ${props.fields.preco.value}` : ""
              }`,
          }
        ),
        origem: fields.select({
          label: "Origem",
          options: [
            { label: "Nativa do Brasil", value: "Nativa" },
            { label: "Naturalizada", value: "Naturalizada" },
            { label: "Cultivada / Exótica", value: "Cultivada" },
          ],
          defaultValue: "Cultivada",
        }),
        distribuicao: fields.text({
          label: "Distribuição / Origem geográfica",
          description: "Ex.: Sudeste Asiático; Mata Atlântica (SE, S)",
        }),
        luminosidade: fields.multiselect({
          label: "Luminosidade",
          options: [
            { label: "Sol pleno", value: "Sol" },
            { label: "Meia-luz", value: "Meia-luz" },
            { label: "Sombra", value: "Sombra" },
          ],
          defaultValue: ["Meia-luz"],
        }),
        formaVida: fields.select({
          label: "Forma de vida",
          options: [
            { label: "Erva", value: "Erva" },
            { label: "Arbusto", value: "Arbusto" },
            { label: "Árvore", value: "Árvore" },
            { label: "Trepadeira / Liana", value: "Trepadeira" },
            { label: "Palmeira", value: "Palmeira" },
            { label: "Suculenta / Cacto", value: "Suculenta" },
          ],
          defaultValue: "Erva",
        }),
        substrato: fields.multiselect({
          label: "Substrato / Hábito",
          options: [
            { label: "Terrícola", value: "Terrícola" },
            { label: "Epífita", value: "Epífita" },
            { label: "Rupícola", value: "Rupícola" },
            { label: "Aquática", value: "Aquática" },
          ],
          defaultValue: ["Terrícola"],
        }),
        rega: fields.select({
          label: "Necessidade de água",
          options: [
            { label: "Baixa", value: "Baixa" },
            { label: "Moderada", value: "Moderada" },
            { label: "Alta", value: "Alta" },
          ],
          defaultValue: "Moderada",
        }),
        toxica: fields.checkbox({
          label: "Tóxica para humanos/animais",
          defaultValue: false,
        }),
        fonte: fields.text({
          label: "Fonte das informações",
          description: "Ex.: Flora e Funga do Brasil (JBRJ); POWO; aroid.org",
        }),
        descricao: fields.markdoc({
          label: "Descrição",
          description: "Texto detalhado sobre a planta, cultivo e curiosidades.",
        }),
      },
    }),
  },
  singletons: {
    marca: singleton({
      label: "Marca / Logo",
      path: "content/marca",
      schema: {
        logo: fields.image({
          label: "Logo",
          description:
            "Logotipo exibido na barra lateral e no topo. PNG/SVG com fundo transparente fica melhor.",
          directory: "public/images/marca",
          publicPath: "/images/marca/",
        }),
        nome: fields.text({
          label: "Nome da marca",
          defaultValue: "Flora Mattos",
        }),
        subtitulo: fields.text({
          label: "Subtítulo",
          defaultValue: "Cultivo Afetivo",
        }),
      },
    }),
  },
});
