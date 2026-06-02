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

O Keystatic usa **storage GitHub** (repo `allan-sanches/catalogo-flora`) — ver [`keystatic.config.tsx`](keystatic.config.tsx). O build de produção **exige** as variáveis da GitHub App, então crie a App **antes** de deployar:

**1. Crie a GitHub App (gera as variáveis) — rode localmente:**
```bash
npm run dev
```
Abra **http://localhost:3000/keystatic** → **"Connect to GitHub"**. O Keystatic cria a GitHub App e grava no seu `.env` local:
- `KEYSTATIC_SECRET`
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

**2. Importe o repo na Vercel** (`allan-sanches/catalogo-flora`) — build `next build` detectado automaticamente.

**3. Em Vercel → Project → Settings → Environment Variables**, cole as 4 variáveis acima (todos os ambientes). Veja [`.env.example`](.env.example).

**4. Deploy.** O site público é estático/SSR (lê o conteúdo commitado em `content/`). Editar/subir fotos pelo painel `/keystatic` hospedado vira **commit no GitHub**, que dispara um novo deploy automático.

> Sem as variáveis, o `next build` falha de propósito (lembrete do Keystatic). Por isso o passo 1 vem antes do deploy.
