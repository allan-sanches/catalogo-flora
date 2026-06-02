# 🌿 Catálogo Flora

Catálogo virtual de plantas com **SSR**, conteúdo em **MDX/Markdoc** gerenciado pelo **Keystatic**, interface com **daisyUI + Tailwind v4**, sobre **Next.js (App Router)** e **React 19**. Pronto para deploy na **Vercel**.

## Recursos

- Sidebar com **índice** agrupado por família e **busca** por família, gênero ou espécie.
- Página de detalhe com **foto**, **descrição** rica (Markdoc) e **badges** (família, origem, luminosidade — sol/meia-luz/sombra, forma de vida, toxicidade).
- Painel de edição de conteúdo em `/keystatic` (sem banco de dados — grava arquivos em `content/`).
- Dados inspirados na [Flora e Funga do Brasil (JBRJ)](https://floradobrasil.jbrj.gov.br).

## Rodando localmente

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Editor de conteúdo: http://localhost:3000/keystatic

## Conteúdo

Cada planta é um arquivo em [`content/plantas/`](content/plantas/) com frontmatter (campos estruturados) + corpo em Markdoc. Edite pelo painel `/keystatic` ou direto nos arquivos.

## Deploy na Vercel

1. Suba o repositório no GitHub e importe na Vercel (o build é `next build`, detectado automaticamente).
2. O catálogo é renderizado a partir dos arquivos em `content/` (commit no repositório).
3. Para **editar o conteúdo pelo painel hospedado**, troque a `storage` em [`keystatic.config.tsx`](keystatic.config.tsx) de `{ kind: 'local' }` para `{ kind: 'github', repo: 'usuario/repo' }` e configure a GitHub App do Keystatic. No modo `local`, o painel funciona apenas em desenvolvimento (o filesystem da Vercel é somente leitura).
