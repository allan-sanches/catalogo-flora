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

O Keystatic usa **storage GitHub** quando as credenciais existem; sem elas em produção, cai para `local` — então o **primeiro deploy não falha** e o site público sobe normalmente. Ver [`keystatic.config.tsx`](keystatic.config.tsx).

**1. Importe o repo na Vercel** (`allan-sanches/catalogo-flora`). Build `next build` detectado automaticamente → o **site público já fica no ar** (catálogo, PDF, panfletos).

**2. Para habilitar a edição/upload pelo painel hospedado**, crie a GitHub App (uma vez), rodando localmente:
```bash
npm run dev
```
Abra **http://localhost:3000/keystatic** → **"Connect to GitHub"**. O Keystatic cria a GitHub App e grava no seu `.env` local:
- `KEYSTATIC_SECRET`
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

**3. Em Vercel → Project → Settings → Environment Variables**, cole essas 4 variáveis (Production/Preview/Development) e **Redeploy**. Veja [`.env.example`](.env.example).

**4. Pronto.** Agora `/keystatic` hospedado edita o conteúdo gravando **commits no GitHub**, que disparam novo deploy automático. O site é estático/SSR e lê o conteúdo commitado em `content/`.
