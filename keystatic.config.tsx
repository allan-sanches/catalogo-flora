import { config, fields, collection, singleton } from "@keystatic/core";

export const markdocConfig = {
  tags: {},
  nodes: {},
};

export default config({
  // Storage GitHub quando a App está configurada (produção com env) OU em dev
  // (para o onboarding criar a App). Sem isso em produção, cai para `local`,
  // assim o 1º deploy na Vercel não falha e o site público sobe.
  //
  // IMPORTANTE: este config também é importado pelo painel no CLIENTE, então a
  // condição usa apenas variáveis visíveis ao cliente (NODE_ENV e NEXT_PUBLIC_*).
  // Usar uma var só-de-servidor aqui faz o cliente achar que é `local` (erro
  // "Unable to load collection / Not Found").
  storage:
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
      ? { kind: "github", repo: "allan-sanches/catalogo-flora" }
      : { kind: "local" },
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
          label: "Foto de destaque (capa)",
          description: "Foto principal — usada no card, no panfleto e no PDF.",
          directory: "public/images/plantas",
          publicPath: "/images/plantas/",
        }),
        imagemPadrao: fields.image({
          label: "Foto padrão (secundária)",
          description: "Segunda foto da planta — usada nos panfletos (refactor).",
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
            situacao: fields.select({
              label: "Situação",
              options: [
                { label: "Disponível", value: "Disponível" },
                { label: "Indisponível", value: "Indisponível" },
                { label: "Sob encomenda", value: "Sob encomenda" },
              ],
              defaultValue: "Disponível",
            }),
          }),
          {
            label: "Tamanhos e preços",
            itemLabel: (props) =>
              `${props.fields.tamanho.value}${
                props.fields.preco.value ? ` — R$ ${props.fields.preco.value}` : ""
              } · ${props.fields.situacao.value}`,
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
          label: "Logo vertical",
          description:
            "Logo na vertical (marca + texto empilhados). Usado por padrão nos panfletos.",
          directory: "public/images/marca",
          publicPath: "/images/marca/",
        }),
        logoHorizontal: fields.image({
          label: "Logo horizontal (alternativo)",
          description:
            "Versão horizontal do logo. Usada no topo do site e como opção nos panfletos.",
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
