// Gera os arquivos de conteúdo do catálogo. Uso: node scripts/gen-catalogo.mjs
// Dados por ESPÉCIE verificados na Flora e Funga do Brasil (JBRJ), com
// complemento de POWO/Kew e aroid.org para espécies exóticas/cultivares.
// Consolidado POR NOME, com TAMANHOS (P/M/G).
//
// PRESERVA a foto (`imagem`) e o `creditoImagem` já enviados pelo painel /keystatic.
// O restante (nome científico, autor, origem, distribuição, badges e a DESCRIÇÃO)
// é a fonte da verdade deste arquivo e é regravado a cada execução.
import {
  writeFileSync,
  readdirSync,
  unlinkSync,
  mkdirSync,
  existsSync,
  readFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "content", "plantas");

// n=nome, ci=nome científico, au=autor, g=gênero, e=espécie,
// f=forma de vida, o=origem, d=distribuição, lz=luz, sb=substrato, rg=rega,
// r=descrição, t=tamanhos [tamanho, preço, precoDe?]
const plants = [
  { n: "Philodendron melanochrysum", ci: "Philodendron melanochrysum", au: "Linden & André", g: "Philodendron", e: "melanochrysum", f: "Trepadeira", o: "Cultivada", d: "Nativa da Colômbia e Equador; no Brasil consta na Flora apenas como cultivada (RJ)", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Filodendro-veludo, valorizado pelas folhas alongadas aveludadas verde-escuras com nervuras douradas. Trepadeira que se desenvolve melhor com tutor, luz indireta brilhante e substrato leve e bem drenado.", t: [["P", "40,00"], ["M", "85,00"]] },
  { n: "Philodendron spiritus-sancti", ci: "Philodendron spiritus-sancti", au: "G.S.Bunting", g: "Philodendron", e: "spiritus-sancti", f: "Trepadeira", o: "Nativa", d: "Mata Atlântica; endêmica do Espírito Santo (ES)", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Espécie rara e criticamente ameaçada, endêmica do Espírito Santo, com folhas longas, pendentes e profundamente recortadas. Muito cobiçada por colecionadores; exige alta umidade e luz filtrada.", t: [["M", "120,00"]] },
  { n: "Philodendron camposportoanum", ci: "Philodendron camposportoanum", au: "G.M.Barroso", g: "Philodendron", e: "camposportoanum", f: "Trepadeira", o: "Nativa", d: "Amazônia, Cerrado e Mata Atlântica; AM, AC, RO, MT e GO", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Filodendro compacto e nativo do Brasil que muda de forma foliar com a maturidade, passando de folhas cordadas a trilobadas com brilho aveludado. Fácil de cultivar em luz indireta.", t: [["P", "42,00", "55,00"], ["M", "95,00", "120,00"]] },
  { n: "Anthurium magnificum", ci: "Anthurium magnificum", au: "Linden", g: "Anthurium", e: "magnificum", f: "Erva", o: "Cultivada", d: "Nativa da Colômbia; não ocorre no Brasil", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Antúrio aveludado de grandes folhas cordadas verde-escuras com nervuras prateadas e pecíolos quadrangulares alados. Exige alta umidade, luz indireta e substrato muito aerado.", t: [["M", "99,00", "149,00"]] },
  { n: "Philodendron micans", ci: "Philodendron hederaceum var. hederaceum", au: "(Jacq.) Schott", g: "Philodendron", e: "hederaceum", f: "Trepadeira", o: "Nativa", d: "Amazônia e Mata Atlântica; BA, ES, AM, AL, PA, AC, PE", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Conhecida no comércio como 'micans', é a forma aveludada de folhas cordadas em tons de verde-bronze a púrpura. Trepadeira/pendente de cultivo fácil, ideal para cestas suspensas.", t: [["M", "55,00", "65,00"], ["G", "65,00"]] },
  { n: "Anthurium macrolobium", ci: "Anthurium × macrolobum", au: "W.Bull (híbrido)", g: "Anthurium", e: "× macrolobum", f: "Erva", o: "Cultivada", d: "Híbrido hortícola (A. leuconeurum × A. pedatoradiatum), descrito em 1883; não ocorre na natureza", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Antúrio ornamental de folhas profundamente lobadas/pedadas, comercializado como 'macrolobium' mas tratado como o híbrido Anthurium × macrolobum. Requer luz indireta e alta umidade.", t: [["M", "289,00", "350,00"], ["G", "480,00"]] },
  { n: "Anthurium crystallinum", ci: "Anthurium crystallinum", au: "Linden & André", g: "Anthurium", e: "crystallinum", f: "Erva", o: "Cultivada", d: "Nativa da Colômbia, Panamá e Peru; no Brasil consta na Flora apenas como cultivada (MG, PR)", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Antúrio-cristal, célebre pelas folhas aveludadas verde-escuras com nervuras branco-prateadas cristalinas. Planta de coleção que demanda alta umidade, luz filtrada e substrato leve.", t: [["M", "110,00"]] },
  { n: "Philodendron 69686", ci: "Philodendron sp. '69686'", au: "", g: "Philodendron", e: "sp.", f: "Trepadeira", o: "Cultivada", d: "Forma de identidade botânica não resolvida, catalogada sob o código de acesso 69686; sem distribuição natural confirmada", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Filodendro de identidade botânica ainda não resolvida, conhecido apenas pelo código de acesso 69686, com folhas lobadas. Não descrito formalmente nem listado na Flora do Brasil.", t: [["G", "79,00"]] },
  { n: "Anthurium magnificum × forgetii", ci: "Anthurium magnificum × forgetii", au: "híbrido hortícola", g: "Anthurium", e: "magnificum × forgetii", f: "Erva", o: "Cultivada", d: "Híbrido de cultivo entre duas espécies colombianas; não ocorre na natureza", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Híbrido de folhas aveludado-cristalinas, arredondadas e peltadas, com nervuras prateadas marcantes, unindo o porte do magnificum às folhas peltadas do forgetii. Exige umidade alta e luz indireta.", t: [["P", "99,00"], ["M", "120,00"], ["G", "160,00", "189,00"]] },
  { n: "Anthurium 'Regale × Magnificum'", ci: "Anthurium regale × magnificum", au: "híbrido hortícola", g: "Anthurium", e: "regale × magnificum", f: "Erva", o: "Cultivada", d: "Híbrido de cultivo (regale do Peru × magnificum da Colômbia); não ocorre na natureza", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Híbrido de grande porte que une a venação ampla do regale à textura aveludada do magnificum, com folhas cordadas que chegam a 60 cm. Pede umidade alta e luz indireta brilhante.", t: [["Único", "140,00"]] },
  { n: "Alocasia 'Regal Shields'", ci: "Alocasia 'Regal Shields'", au: "cultivar (A. odora × A. reginula)", g: "Alocasia", e: "'Regal Shields'", f: "Erva", o: "Cultivada", d: "Cultivar híbrida de horticultura; parentais do Sudeste Asiático", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Orelha-de-elefante robusta com grandes folhas em escudo verde-escuras e nervuras destacadas. Vigorosa e mais tolerante que outras alocásias; prefere luz indireta brilhante, calor e umidade.", t: [["M", "45,00", "65,00"], ["G", "99,00", "129,00"]] },
  { n: "Syngonium 'Rosa'", ci: "Syngonium podophyllum 'Pink'", au: "cultivar (espécie: Schott)", g: "Syngonium", e: "podophyllum", f: "Trepadeira", o: "Cultivada", d: "Cultivar hortícola; a espécie S. podophyllum é nativa do México à Bolívia", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Singônio de folhagem sagitada em tons de rosa variegado, muito ornamental e de cultivo fácil. Mantém melhor a coloração rosada sob luz indireta brilhante e umidade média a alta.", t: [["Único", "35,00"]] },
  { n: "Philodendron 'Splendid'", ci: "Philodendron melanochrysum × verrucosum", au: "híbrido hortícola", g: "Philodendron", e: "melanochrysum × verrucosum", f: "Trepadeira", o: "Cultivada", d: "Híbrido de cultivo (parentais da Colômbia/Equador e América Central); não ocorre na natureza", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Híbrido aveludado que reúne a textura do melanochrysum às nervuras largas do verrucosum, com folhas grandes e cordadas. Trepadeira que prospera com tutor, luz indireta, calor e umidade.", t: [["M", "99,00"], ["G", "120,00"]] },
  { n: "Anthurium clarinervium", ci: "Anthurium clarinervium", au: "Matuda", g: "Anthurium", e: "clarinervium", f: "Erva", o: "Cultivada", d: "Nativa do México (Chiapas), sobre rochas calcárias; não ocorre no Brasil", lz: ["Meia-luz"], sb: ["Rupícola", "Epífita"], rg: "Moderada", r: "Antúrio mexicano de folhas cordadas aveludadas verde-escuras com nervuras prateadas marcantes. Cultivado como planta de interior; aprecia substrato muito drenante e umidade alta.", t: [["M", "75,00"]] },
  { n: "Philodendron ornatum", ci: "Philodendron ornatum", au: "Schott", g: "Philodendron", e: "ornatum", f: "Trepadeira", o: "Nativa", d: "Amazônia, Caatinga e Mata Atlântica; AC, AM, AP, BA, CE, ES, MG, PA, PE, RJ, RO, RR, SP", lz: ["Meia-luz", "Sombra"], sb: ["Epífita"], rg: "Alta", r: "Filodendro hemiepífito nativo do Brasil, presente em matas ciliares, de igapó, várzea e ombrófilas. Amplamente distribuído pela Amazônia e Mata Atlântica.", t: [["G", "119,00", "249,00"]] },
  { n: "Philodendron sodiroi", ci: "Philodendron sodiroi", au: "hort.", g: "Philodendron", e: "sodiroi", f: "Trepadeira", o: "Cultivada", d: "No Brasil registrada apenas como cultivada (RJ); origem atribuída ao noroeste da América do Sul", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Filodendro trepador de folhas cordadas com marmoreio prateado metálico. Consta na Flora do Brasil somente como planta cultivada; o epíteto homenageia o botânico Luis Sodiro.", t: [["M", "65,00", "99,00"], ["G", "80,00"]] },
  { n: "Monstera 'Albo Variegata'", ci: "Monstera deliciosa 'Albo Variegata'", au: "Liebm. (espécie)", g: "Monstera", e: "deliciosa", f: "Trepadeira", o: "Cultivada", d: "Cultivar de variegação branca; a espécie é nativa do sul do México à América Central e, no Brasil, consta apenas como cultivada", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Cultivar variegada de Monstera deliciosa com manchas brancas instáveis. Trepadeira de folhas fenestradas que pede luz indireta brilhante para manter a variegação.", t: [["Único", "89,00"]] },
  { n: "Anthurium clarinervium × macrolobium", ci: "Anthurium clarinervium × macrolobium", au: "híbrido hortícola", g: "Anthurium", e: "clarinervium × macrolobium", f: "Erva", o: "Cultivada", d: "Híbrido hortícola; A. clarinervium é do México e A. macrolobium do norte da América do Sul", lz: ["Meia-luz"], sb: ["Epífita", "Rupícola"], rg: "Moderada", r: "Híbrido ornamental valorizado pela folhagem aveludada com nervuras claras. Sem registro na Flora do Brasil por ser híbrido de cultivo; aprecia substrato drenante e alta umidade.", t: [["M", "120,00"]] },
  { n: "Philodendron 'Paraíso Verde'", ci: "Philodendron hederaceum 'Paraíso Verde'", au: "cultivar (espécie: (Jacq.) Schott)", g: "Philodendron", e: "hederaceum", f: "Trepadeira", o: "Cultivada", d: "Cultivar ornamental; a espécie-base P. hederaceum ocorre no Brasil, mas o cultivar é hortícola", lz: ["Meia-luz"], sb: ["Epífita"], rg: "Moderada", r: "Cultivar trepador de folhas verde-limão mosqueadas. Seleção hortícola de cultivo fácil; aprecia luz indireta e regas moderadas.", t: [["M", "89,00"], ["G", "99,00"]] },
  { n: "Philodendron mayoi", ci: "Philodendron mayoi", au: "E.G.Gonç.", g: "Philodendron", e: "mayoi", f: "Trepadeira", o: "Nativa", d: "Cerrado; endêmica de Goiás e Distrito Federal, em matas de galeria", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Filodendro hemiepífito endêmico do Cerrado brasileiro (GO e DF), com folhas pinatissectas que lembram uma palmeira. Descrito por E.G. Gonçalves.", t: [["G", "120,00"]] },
  { n: "Philodendron mamei", ci: "Philodendron mamei", au: "André", g: "Philodendron", e: "mamei", f: "Trepadeira", o: "Cultivada", d: "Nativa dos Andes orientais do sul do Equador (731–1830 m); não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Moderada", r: "Filodendro de hábito rastejante e folhas cordadas verde-escuras com manchas prateadas, nativo do Equador. Aprecia substrato leve, calor e umidade alta.", t: [["M", "75,00"], ["G", "99,00"]] },
  { n: "Monstera 'Thai Constellation'", ci: "Monstera deliciosa 'Thai Constellation'", au: "Liebm. (espécie)", g: "Monstera", e: "deliciosa", f: "Trepadeira", o: "Cultivada", d: "Cultivar de variegação creme estável criada por cultura de tecidos na Tailândia; a espécie é nativa do México/América Central", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Cultivar de Monstera deliciosa com variegação creme estável tipo 'constelação'. Trepadeira de folhas fenestradas, de grande efeito ornamental; luz indireta brilhante.", t: [["G", "389,00"]] },
  { n: "Alocasia 'Frydek'", ci: "Alocasia micholitziana 'Frydek'", au: "Sander (espécie)", g: "Alocasia", e: "micholitziana", f: "Erva", o: "Cultivada", d: "Cultivar; a espécie é endêmica do norte de Luzon, Filipinas. Não ocorre no Brasil", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Cultivar 'Frydek' (Veludo Verde) de folhas sagitadas aveludadas verde-escuras e nervuras brancas. Aprecia calor, umidade alta e substrato drenante.", t: [["Único", "75,00"]] },
  { n: "Philodendron joepii", ci: "Philodendron × joepii", au: "Croat", g: "Philodendron", e: "× joepii", f: "Trepadeira", o: "Cultivada", d: "Híbrido natural raro (P. bipennifolium × P. pedatum); nativo da Guiana Francesa", lz: ["Meia-luz"], sb: ["Epífita"], rg: "Moderada", r: "Raro híbrido natural descrito por Croat (2022), descoberto por Joep Moonen na Guiana Francesa, com folhas de formato peculiar de três lobos. Planta de colecionador.", t: [["G", "220,00"]] },
  { n: "Philodendron 'Gergaji Golden'", ci: "Philodendron 'Gergaji Golden'", au: "cultivar", g: "Philodendron", e: "'Gergaji Golden'", f: "Arbusto", o: "Cultivada", d: "Híbrido/cultivar ornamental de origem hortícola; não ocorre na natureza", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Cultivar autoportante de folhas profundamente lobadas e serrilhadas em tom dourado-esverdeado ('gergaji' significa 'serra' em indonésio). Aprecia luz indireta brilhante.", t: [["P", "36,00", "45,00"]] },
  { n: "Philodendron gloriosum", ci: "Philodendron gloriosum", au: "André", g: "Philodendron", e: "gloriosum", f: "Erva", o: "Cultivada", d: "Nativa da Colômbia; no Brasil registrada apenas como cultivada (RJ). Hábito reptante", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Moderada", r: "Aroide reptante de folhas aveludadas grandes com nervuras claras, muito cultivada como ornamental. Cresce na horizontal a partir de um rizoma; aprecia substrato drenante.", t: [["M", "60,00"]] },
  { n: "Lírio-da-paz variegata", ci: "Spathiphyllum sp. (cultivar variegada)", au: "", g: "Spathiphyllum", e: "sp.", f: "Erva", o: "Cultivada", d: "Cultivar ornamental variegada; o gênero Spathiphyllum é neotropical (América Central e do Sul)", lz: ["Sombra", "Meia-luz"], sb: ["Terrícola"], rg: "Alta", r: "Lírio-da-paz em forma variegada, planta de folhagem e espatas brancas. Cresce bem à sombra/meia-luz, com solo sempre úmido; murcha quando falta água e recupera-se após a rega.", t: [["Único", "65,00"]] },
  { n: "Philodendron 'Pink Princess'", ci: "Philodendron erubescens 'Pink Princess'", au: "espécie: K.Koch & Augustin", g: "Philodendron", e: "erubescens", f: "Trepadeira", o: "Cultivada", d: "Cultivar variegado (mutação rosa); a espécie-base P. erubescens é nativa da Colômbia", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Cultivar de P. erubescens com variegação rosa marcante. Trepadeira hemiepífita ornamental muito procurada; precisa de luz indireta brilhante para manter o rosa.", t: [["P", "45,00", "55,00"], ["M", "110,00", "130,00"], ["G", "240,00", "280,00"]] },
  { n: "Anthurium pedatoradiatum", ci: "Anthurium pedatoradiatum", au: "Schott", g: "Anthurium", e: "pedatoradiatum", f: "Erva", o: "Cultivada", d: "Nativa do sul do México (Veracruz, Oaxaca, Chiapas, Tabasco); não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Antúrio de folhas profundamente lobadas/pedadas, nativo do sul do México. Cultivado como ornamental; aprecia umidade alta e luz filtrada.", t: [["Único", "110,00"]] },
  { n: "Rhaphidophora decursiva", ci: "Rhaphidophora decursiva", au: "(Roxb.) Schott", g: "Rhaphidophora", e: "decursiva", f: "Trepadeira", o: "Cultivada", d: "Nativa da Ásia (Índia ao sul da China e Indochina); no Brasil apenas cultivada (RJ, SP)", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Trepadeira hemiepífita asiática de folhas fenestradas/pinatífidas, cultivada como ornamental. Sobe em tutor de musgo e aprecia boa umidade.", t: [["G", "89,00"]] },
  { n: "Philodendron bernardopazii", ci: "Philodendron bernardopazii", au: "E.G.Gonç.", g: "Philodendron", e: "bernardopazii", f: "Erva", o: "Nativa", d: "Mata Atlântica; endêmica do Espírito Santo (ES)", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Aroide hemiepífito endêmico da Mata Atlântica do Espírito Santo, com folhas grandes de nervuras destacadas. Espécie nativa de cultivo apreciado por colecionadores.", t: [["G", "189,00", "250,00"]] },
  { n: "Philodendron squamiferum", ci: "Philodendron squamiferum", au: "Poepp.", g: "Philodendron", e: "squamiferum", f: "Trepadeira", o: "Nativa", d: "Amazônia; endêmica do Brasil (PA, AP)", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Trepadeira hemiepífita amazônica notável pelos pecíolos cobertos de escamas/cerdas vermelhas e folhas pedadas. Espécie nativa do Brasil.", t: [["M", "25,00"], ["G", "75,00"]] },
  { n: "Alocasia cuprea", ci: "Alocasia cuprea", au: "(K.Koch & C.D.Bouché) K.Koch", g: "Alocasia", e: "cuprea", f: "Erva", o: "Cultivada", d: "Nativa de Bornéu; no Brasil apenas cultivada (SP)", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Moderada", r: "Alocásia de Bornéu com folhas metálicas cor de cobre e nervuras escuras. Ornamental de interior; aprecia calor, umidade alta e substrato drenante.", t: [["Único", "75,00"]] },
  { n: "Philodendron verrucosum", ci: "Philodendron verrucosum", au: "L.Mathieu ex Schott", g: "Philodendron", e: "verrucosum", f: "Trepadeira", o: "Cultivada", d: "Nativa da Costa Rica ao Peru; no Brasil apenas cultivada (RJ, SP)", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Alta", r: "Trepadeira de folhas aveludadas verde-escuras com pecíolos verrucosos pilosos, nativa da América Central/andina. Exige umidade alta e luz filtrada.", t: [["Único", ""]] },
  { n: "Anthurium macrolobium × 'Batman'", ci: "Anthurium × macrolobum 'Batman'", au: "W.Bull", g: "Anthurium", e: "× macrolobum", f: "Erva", o: "Cultivada", d: "Híbrido hortícola conhecido como 'Batman'; sem ocorrência natural", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Antúrio híbrido ornamental 'Batman', de folhas escuras profundamente lobadas. Híbrido de cultivo; aprecia luz indireta e alta umidade.", t: [["M", "120,00"], ["G", "139,00"]] },
  { n: "Philodendron tortum", ci: "Philodendron tortum", au: "M.L.Soares & Mayo", g: "Philodendron", e: "tortum", f: "Trepadeira", o: "Nativa", d: "Amazônia; AM, MT, AC, RO", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Trepadeira hemiepífita amazônica de folhas profundamente recortadas em segmentos finos, com aparência de samambaia. Espécie nativa do Brasil.", t: [["M", "25,00", "65,00"], ["G", "120,00"]] },
  { n: "Philodendron 'Dark Lord'", ci: "Philodendron erubescens 'Dark Lord'", au: "espécie: K.Koch & Augustin", g: "Philodendron", e: "erubescens", f: "Trepadeira", o: "Cultivada", d: "Cultivar de P. erubescens (linhagem 'Imperial Red'); a espécie é nativa da Colômbia", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Cultivar de P. erubescens com folhas grandes: as novas avermelhadas e as maduras verde-escuras quase negras. Trepadeira ornamental de luz indireta brilhante.", t: [["P", "50,00", "65,00"], ["M", "60,00", "75,00"], ["G", "280,00"]] },
  { n: "Anthurium sanguineum", ci: "Anthurium sanguineum", au: "Engl.", g: "Anthurium", e: "sanguineum", f: "Erva", o: "Cultivada", d: "Nativa dos Andes da Colômbia e Equador (550–3000 m); não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Antúrio andino de folhagem ornamental, cultivado como planta de coleção. Aprecia clima ameno, umidade alta e substrato leve.", t: [["P", "60,00"], ["M", "110,00"], ["G", "220,00"]] },
  { n: "Anthurium 'Portillae × Forgetii'", ci: "Anthurium portillae × forgetii", au: "híbrido hortícola", g: "Anthurium", e: "portillae × forgetii", f: "Erva", o: "Cultivada", d: "Híbrido de cultivo; espécies parentais do Equador/Colômbia", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Híbrido ornamental entre A. portillae e A. forgetii, de folhas aveludadas com venação prateada. Híbrido hortícola; aprecia alta umidade e luz indireta.", t: [["Único", "130,00", "179,00"]] },
  { n: "Philodendron 'Burle Marx Flame'", ci: "Philodendron 'Burle Marx Flame'", au: "cultivar", g: "Philodendron", e: "'Burle Marx Flame'", f: "Trepadeira", o: "Cultivada", d: "Cultivar hortícola; o gênero Philodendron é neotropical", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Cultivar de Philodendron com folhas novas avermelhadas e lobadas. Trepadeira ornamental de cultivo fácil em luz indireta.", t: [["M", "275,00", "340,00"]] },
  { n: "Anthurium papillilaminum", ci: "Anthurium papillilaminum", au: "Croat", g: "Anthurium", e: "papillilaminum", f: "Erva", o: "Cultivada", d: "Endêmica do Panamá (Colón e Darién); não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Moderada", r: "Aroide de folhas escuras aveludadas e papilosas, endêmica do Panamá. Planta de coleção que demanda alta umidade e luz filtrada.", t: [["M", "110,00"]] },
  { n: "Alocasia 'Corazon'", ci: "Alocasia heterophylla 'Corazon'", au: "cultivar (espécie: (K.Krause) Merr.)", g: "Alocasia", e: "heterophylla", f: "Erva", o: "Cultivada", d: "Cultivar de Alocasia heterophylla (Filipinas); não ocorre no Brasil", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Cultivar de Alocasia heterophylla das Filipinas, de folhas cordiformes coriáceas em tom verde-azulado metálico. Aprecia calor e umidade.", t: [["Único", "25,00"]] },
  { n: "Alocasia longiloba", ci: "Alocasia longiloba", au: "Miq.", g: "Alocasia", e: "longiloba", f: "Erva", o: "Cultivada", d: "Nativa do Sudeste Asiático; na Flora do Brasil consta apenas como cultivada (MG)", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Aroide do Sudeste Asiático com folhas sagitadas e venação prateada. Cultivada como ornamental; aprecia calor, umidade e substrato drenante.", t: [["P", "25,00"]] },
  { n: "Alocasia 'Watsoniana Tiffany'", ci: "Alocasia longiloba 'Watsoniana'", au: "cultivar (espécie: Miq.)", g: "Alocasia", e: "longiloba", f: "Erva", o: "Cultivada", d: "Cultivar do complexo Alocasia longiloba (Sudeste Asiático)", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Cultivar do complexo A. longiloba, com folhas verde-escuras de venação prateada e face inferior arroxeada. Ornamental de interior.", t: [["Único", "75,00"]] },
  { n: "Monstera deliciosa 'Large Form'", ci: "Monstera deliciosa", au: "Liebm.", g: "Monstera", e: "deliciosa", f: "Trepadeira", o: "Cultivada", d: "Forma de grande porte; a espécie no Brasil consta só como cultivada (nativa do México/América Central)", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Forma de grande porte de Monstera deliciosa, com folhas amplas e fenestrações profundas. Trepadeira vigorosa de cultivo fácil em luz indireta.", t: [["Único", "89,00"]] },
  { n: "Syngonium 'Milk Confetti'", ci: "Syngonium podophyllum 'Milk Confetti'", au: "cultivar (espécie: Schott)", g: "Syngonium", e: "podophyllum", f: "Trepadeira", o: "Cultivada", d: "Cultivar variegado; a espécie S. podophyllum consta como naturalizada no Brasil", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Cultivar variegado de S. podophyllum, de folhas creme-esverdeadas pintalgadas de rosa. Trepadeira/pendente de cultivo fácil em luz indireta.", t: [["Único", "35,00"]] },
  { n: "Philodendron 'Dean McDowell'", ci: "Philodendron gloriosum × pastazanum 'Dean McDowell'", au: "hort. (J. Banta, 1988)", g: "Philodendron", e: "gloriosum × pastazanum", f: "Erva", o: "Cultivada", d: "Híbrido hortícola (criado por John Banta, 1988); parentais da Colômbia/Equador", lz: ["Meia-luz"], sb: ["Terrícola"], rg: "Moderada", r: "Híbrido entre P. gloriosum e P. pastazanum, de crescimento rastejante e grandes folhas cordiformes aveludadas com venação branca. Aprecia substrato leve.", t: [["M", "150,00"]] },
  { n: "Anthurium 'Metallicum'", ci: "Anthurium metallicum", au: "Linden ex Schott", g: "Anthurium", e: "metallicum", f: "Erva", o: "Cultivada", d: "Endêmica da Colômbia (Cundinamarca); não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Aroide colombiano de folhas grandes com brilho metálico, cultivado como ornamental. Aprecia umidade alta e luz filtrada.", t: [["M", "250,00"]] },
  { n: "Philodendron 'José Buono'", ci: "Philodendron 'Jose Buono'", au: "hort.", g: "Philodendron", e: "'José Buono'", f: "Trepadeira", o: "Cultivada", d: "Cultivar variegado de origem incerta (encontrado em Porto Rico)", lz: ["Meia-luz"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Cultivar variegado de grandes folhas cordiformes com manchas creme/amarelas. Trepadeira ornamental de luz indireta brilhante.", t: [["Único", "89,00"]] },
  { n: "Anthurium forgetii", ci: "Anthurium forgetii", au: "N.E.Br.", g: "Anthurium", e: "forgetii", f: "Erva", o: "Cultivada", d: "Nativa da Colômbia; no Brasil apenas em cultivo", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Aroide colombiano apreciado pelas folhas arredondadas, aveludadas e de venação prateada, sem sinus. Cultivado como planta de interior.", t: [["Único", "100,00"]] },
  { n: "Anthurium luxurians", ci: "Anthurium luxurians", au: "Croat & R.N.Cirino", g: "Anthurium", e: "luxurians", f: "Erva", o: "Cultivada", d: "Nativa da Colômbia (Chocó/região andina), descrita em 2005; não ocorre no Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Epífita", "Terrícola"], rg: "Moderada", r: "Espécie colombiana notável pelas folhas espessas, buladas e de aspecto envernizado. Planta de colecionador; exige alta umidade.", t: [["G", "420,00", "489,00"]] },
  { n: "Philodendron plowmanii", ci: "Philodendron plowmanii", au: "Croat (ined.)", g: "Philodendron", e: "plowmanii", f: "Trepadeira", o: "Cultivada", d: "Nativa de Equador e Peru (300–1200 m); nome ainda não formalmente descrito", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Aroide reptante de Equador/Peru, de folhas grandes onduladas com nervuras claras. Nome ainda não publicado formalmente; cultivada como ornamental.", t: [["M", "110,00"]] },
  { n: "Philodendron atabapoense", ci: "Philodendron atabapoense", au: "G.S.Bunting", g: "Philodendron", e: "atabapoense", f: "Trepadeira", o: "Cultivada", d: "Nativa da Venezuela (Amazonas, rio Atabapo); não consta na Flora do Brasil", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Filodendro hemiepífito descrito por Bunting (1975), de folhas estreitas e alongadas com reverso avinhado. Cultivado como ornamental.", t: [["P", "45,00", "65,00"], ["M", "99,00"], ["G", "120,00"]] },
  { n: "Xanthosoma 'Atrovirens'", ci: "Xanthosoma sagittifolium", au: "(L.) Schott", g: "Xanthosoma", e: "sagittifolium", f: "Erva", o: "Cultivada", d: "Cultivar ('atrovirens' é sinônimo de X. sagittifolium); planta de terras baixas da América do Sul", lz: ["Sol", "Meia-luz"], sb: ["Terrícola"], rg: "Alta", r: "Cultivar de mangará/taioba do gênero Xanthosoma, hoje englobado em X. sagittifolium. Aroide robusto de folhas grandes e efeito tropical.", t: [["Único", "75,00"]] },
  { n: "Philodendron 'Glorious'", ci: "Philodendron gloriosum × melanochrysum", au: "híbrido hortícola", g: "Philodendron", e: "gloriosum × melanochrysum", f: "Trepadeira", o: "Cultivada", d: "Híbrido de cultivo (criado nos anos 1970); sem distribuição natural", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Híbrido ornamental entre P. gloriosum e P. melanochrysum, de folhas aveludadas com venação clara. Une o porte do gloriosum à textura do melanochrysum.", t: [["Único", "79,00"]] },
  { n: "Anthurium 'Acutum'", ci: "Anthurium acutum", au: "N.E.Br.", g: "Anthurium", e: "acutum", f: "Erva", o: "Nativa", d: "Mata Atlântica; endêmica do Brasil (SP, SC, PR)", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Moderada", r: "Erva terrícola endêmica da Mata Atlântica do Sudeste/Sul do Brasil (SP, SC, PR). Nome aceito na Flora e Funga do Brasil.", t: [["Único", "89,00"]] },
  { n: "Anthurium sagittatum", ci: "Anthurium sagittatum", au: "Kunth", g: "Anthurium", e: "sagittatum", f: "Erva", o: "Nativa", d: "Amazônia; endêmica do Brasil (AC, AP, AM, PA, RO, RR, TO)", lz: ["Meia-luz", "Sombra"], sb: ["Terrícola"], rg: "Alta", r: "Erva terrícola amazônica endêmica do Brasil, distribuída pela região Norte. Folhas sagitadas; nome aceito na Flora e Funga do Brasil.", t: [["M", "119,00", "189,00"]] },
  { n: "Philodendron 'White Princess'", ci: "Philodendron erubescens 'White Princess'", au: "espécie: K.Koch & Augustin", g: "Philodendron", e: "erubescens", f: "Trepadeira", o: "Cultivada", d: "Cultivar variegado (manchas brancas); a espécie-base P. erubescens é nativa da Colômbia", lz: ["Meia-luz"], sb: ["Terrícola", "Epífita"], rg: "Moderada", r: "Cultivar variegado de Philodendron erubescens, com folhas marcadas de branco. Trepadeira ornamental que pede luz indireta brilhante.", t: [["M", "48,00", "60,00"]] },
];

// Fonte das informações por espécie (verificação botânica).
const FONTES = {
  "Philodendron melanochrysum": "Flora e Funga do Brasil (JBRJ); POWO",
  "Philodendron spiritus-sancti": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron camposportoanum": "Flora e Funga do Brasil (JBRJ)",
  "Anthurium magnificum": "POWO / Kew",
  "Philodendron micans": "Flora e Funga do Brasil (JBRJ); POWO",
  "Anthurium macrolobium": "POWO / IPNI; aroid.org",
  "Anthurium crystallinum": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Philodendron 69686": "aroid.org (forma indeterminada)",
  "Anthurium magnificum × forgetii": "Horticultura (aroid.org)",
  "Anthurium 'Regale × Magnificum'": "Horticultura especializada",
  "Alocasia 'Regal Shields'": "Horticultura (ASPCA p/ toxicidade)",
  "Syngonium 'Rosa'": "POWO (espécie); horticultura",
  "Philodendron 'Splendid'": "Horticultura especializada",
  "Anthurium clarinervium": "POWO / Kew; aroid.org",
  "Philodendron ornatum": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron sodiroi": "Flora e Funga do Brasil (JBRJ, cultivada); aroid.org",
  "Monstera 'Albo Variegata'": "Flora e Funga do Brasil (espécie); horticultura",
  "Anthurium clarinervium × macrolobium": "POWO; aroid.org",
  "Philodendron 'Paraíso Verde'": "Horticultura; Flora do Brasil (espécie)",
  "Philodendron mayoi": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron mamei": "POWO / Kew",
  "Monstera 'Thai Constellation'": "Flora do Brasil (espécie); horticultura",
  "Alocasia 'Frydek'": "POWO / Kew",
  "Philodendron joepii": "POWO / Kew; Croat 2022 (Aroideana)",
  "Philodendron 'Gergaji Golden'": "Horticultura (foliage-factory)",
  "Philodendron gloriosum": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Lírio-da-paz variegata": "POWO (gênero); horticultura",
  "Philodendron 'Pink Princess'": "POWO (espécie); horticultura",
  "Anthurium pedatoradiatum": "POWO; aroid.org",
  "Rhaphidophora decursiva": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Philodendron bernardopazii": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron squamiferum": "Flora e Funga do Brasil (JBRJ)",
  "Alocasia cuprea": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Philodendron verrucosum": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Anthurium macrolobium × 'Batman'": "POWO; aroid.org",
  "Philodendron tortum": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron 'Dark Lord'": "POWO (espécie); horticultura",
  "Anthurium sanguineum": "POWO / Kew; aroid.org",
  "Anthurium 'Portillae × Forgetii'": "aroid.org; POWO",
  "Philodendron 'Burle Marx Flame'": "POWO; horticultura",
  "Anthurium papillilaminum": "POWO / Kew; aroid.org",
  "Alocasia 'Corazon'": "Horticultura (aroidpedia)",
  "Alocasia longiloba": "Flora e Funga do Brasil (JBRJ, cultivada); POWO",
  "Alocasia 'Watsoniana Tiffany'": "Horticultura; POWO",
  "Monstera deliciosa 'Large Form'": "Flora e Funga do Brasil (espécie); POWO",
  "Syngonium 'Milk Confetti'": "Flora e Funga do Brasil (espécie); horticultura",
  "Philodendron 'Dean McDowell'": "Horticultura (foliage-factory); POWO",
  "Anthurium 'Metallicum'": "POWO / Kew; aroid.org",
  "Philodendron 'José Buono'": "Horticultura (PlantVine; Logee's)",
  "Anthurium forgetii": "POWO / Kew; aroid.org",
  "Anthurium luxurians": "POWO / Kew (Croat & Cirino, 2005)",
  "Philodendron plowmanii": "POWO / aroid.org (nome não validado)",
  "Philodendron atabapoense": "POWO / Kew (Venezuela); ausente na Flora do Brasil",
  "Xanthosoma 'Atrovirens'": "POWO (X. sagittifolium)",
  "Philodendron 'Glorious'": "Horticultura especializada",
  "Anthurium 'Acutum'": "Flora e Funga do Brasil (JBRJ)",
  "Anthurium sagittatum": "Flora e Funga do Brasil (JBRJ)",
  "Philodendron 'White Princess'": "POWO (espécie); horticultura",
};

function slugify(s) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/['"×.()]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const y = (v) => JSON.stringify(v);

// Preserva fotos/crédito já enviados pelo painel.
function readCampo(fm, campo) {
  let v = (fm.match(new RegExp(`^${campo}:\\s*(.+)$`, "m")) || [])[1]?.trim() ?? null;
  if (!v || v === '""' || v === "null" || v === "~") v = null;
  return v;
}
function readImagem(file) {
  if (!existsSync(file)) return { imagem: null, imagemPadrao: null, credito: null };
  const txt = readFileSync(file, "utf8");
  const fm = (txt.match(/^---\n([\s\S]*?)\n---/) || [, ""])[1];
  return {
    imagem: readCampo(fm, "imagem"),
    imagemPadrao: readCampo(fm, "imagemPadrao"),
    credito: readCampo(fm, "creditoImagem"),
  };
}

mkdirSync(OUT, { recursive: true });

const slugs = new Set();
for (const p of plants) {
  let slug = slugify(p.n);
  while (slugs.has(slug)) slug += "-x";
  slugs.add(slug);

  const file = join(OUT, `${slug}.mdoc`);
  const prev = readImagem(file);

  const linhas = [
    "---",
    `nomeComum: ${y(p.n)}`,
    `nomeCientifico: ${y(p.ci)}`,
    `autor: ${y(p.au || "")}`,
    `familia: "Araceae"`,
    `genero: ${y(p.g)}`,
    `especie: ${y(p.e)}`,
  ];
  if (prev.imagem) linhas.push(`imagem: ${prev.imagem}`);
  if (prev.imagemPadrao) linhas.push(`imagemPadrao: ${prev.imagemPadrao}`);
  linhas.push(`creditoImagem: ${prev.credito ? prev.credito : '""'}`);

  linhas.push("tamanhos:");
  for (const [tamanho, preco, precoDe] of p.t) {
    linhas.push(`  - tamanho: ${y(tamanho)}`);
    linhas.push(`    preco: ${y(preco || "")}`);
    linhas.push(`    precoDe: ${y(precoDe || "")}`);
    linhas.push(`    situacao: "Disponível"`);
  }

  linhas.push(`origem: ${y(p.o)}`);
  linhas.push(`distribuicao: ${y(p.d)}`);
  linhas.push("luminosidade:");
  for (const l of p.lz) linhas.push(`  - ${y(l)}`);
  linhas.push(`formaVida: ${y(p.f)}`);
  linhas.push("substrato:");
  for (const sub of p.sb) linhas.push(`  - ${y(sub)}`);
  linhas.push(`rega: ${y(p.rg)}`);
  linhas.push(`toxica: true`);
  const fonteDefault = p.o === "Nativa" ? "Flora e Funga do Brasil (JBRJ)" : "POWO / Kew · aroid.org";
  linhas.push(`fonte: ${y(FONTES[p.n] || fonteDefault)}`);
  linhas.push("---");
  linhas.push(p.r);
  linhas.push("");

  writeFileSync(file, linhas.join("\n"), "utf8");
}

let removidos = 0;
for (const f of readdirSync(OUT)) {
  if (f.endsWith(".mdoc") && !slugs.has(f.replace(/\.mdoc$/, ""))) {
    unlinkSync(join(OUT, f));
    removidos++;
  }
}

console.log(`Gerados ${plants.length} arquivos. Removidos ${removidos} obsoletos.`);
