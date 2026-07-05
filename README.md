# webstudio

Site da agência — landing page com integração Instagram.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Vercel · Supabase

---

## Pré-requisitos

- Node.js 20+
- Conta no GitHub, Vercel e Supabase
- App criado em [developers.facebook.com](https://developers.facebook.com)

---

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencher os valores
npm run dev
```

Acesse http://localhost:3000

---

## Deploy (Vercel)

1. Push para o GitHub (branch main)
2. Vercel > Add New Project > importar repositório
3. Adicionar variáveis do .env.example em Environment Variables
4. Deploy automático a cada push na main

---

## Estrutura de branches

```
main      → produção (protegida — merge via PR obrigatório)
staging   → homologação
feat/*    → features novas
fix/*     → correções
```

---

## Estrutura do projeto

```
app/
  layout.tsx       → root layout, metadata
  page.tsx         → home (monta as seções)
  globals.css      → tokens de design, animações

components/
  layout/
    Navbar.tsx     → nav sticky com mobile drawer
    Footer.tsx
  sections/
    Hero.tsx       → mockup animado Instagram → site
    Stats.tsx      → barra de números
    HowItWorks.tsx → 3 passos (fundo escuro)
    Features.tsx   → 6 cards de diferenciais
    Pricing.tsx    → plano único
    CtaFinal.tsx   → CTA com gradiente

.env.example       → todas as variáveis necessárias (sem valores)
```

---

## Próximas fases

- Fase 2: Integração real da Graph API do Instagram
- Fase 3: Template de site do cliente por slug (/[slug])
- Fase 4: Painel admin (clientes, tokens, cobrança Asaas)
