# Estado do Projeto — webstudio

> Última atualização: sessão de confirmação de acesso (GitHub + Vercel + Supabase)
> e geração deste guia de início de sessão.
> Este documento substitui/atualiza o conhecimento de contexto do projeto.

---

## 🔑 Como começar cada sessão nova — LEIA ISSO PRIMEIRO

Claude **não guarda tokens entre conversas**. Cada sessão nova começa "zerada"
em termos de acesso — mesmo com este `.md` no contexto do projeto, preciso que
David cole os 3 tokens na primeira mensagem (ou assim que for pedir algo que
precise deles) para eu conseguir trabalhar de verdade em vez de só planejar.

**Os 3 tokens, sempre os mesmos até expirarem/serem revogados:**

```
GitHub:   github_pat_...   (repo davidbrochini-web/webstudio-)
Vercel:   vcp_...            (conta inteira — vê os 3 projetos do David)
Supabase: sbp_...            (conta inteira — vê os 3 projetos do David)
```

⚠️ Os tokens de Vercel e Supabase são **de conta**, não de projeto — dão
acesso também aos outros 2 produtos do David (`casosesquecidos`,
`omnipromo-admin`). Claude deve se limitar ao projeto **webstudio** salvo
pedido explícito em contrário. Ver seção de credenciais mais abaixo para
onde gerar cada um caso expire.

### O que Claude consegue fazer sozinho, com esses 3 tokens, sem depender do David clicar em nada:

- **GitHub**: criar branch, commitar, abrir PR, mergear (squash), deletar
  branch — fluxo completo de `feat/fix` → PR → merge, sem David tocar no
  teclado
- **Supabase**: criar/alterar tabelas, rodar qualquer SQL (migrations,
  queries, correções), via Management API (`api.supabase.com`) — **não** via
  `psql` direto, ver limitação de rede na seção correspondente mais abaixo
- **Vercel**: consultar projetos, deploys, variáveis de ambiente, domínios
  (via API) — ainda não usado para *alterar* nada, só testado como leitura
  até agora; alteração (setar env var, redeploy manual) deveria funcionar
  também mas não foi testada nesta sessão

### O que ainda depende do David clicar em algo:

- Criar/configurar o projeto inicial na Vercel (import do GitHub) — feito
  uma vez, já está pronto
- Aprovar/revisar PRs manualmente, se quiser esse controle (hoje Claude
  mergeia sozinho quando o CI passa — combinado assim, mas David pode pedir
  para parar de mergear sem revisão a qualquer momento)
- Qualquer ação fora do escopo de GitHub/Vercel/Supabase (ex: Meta for
  Developers, Asaas — sem API/token configurado ainda)

---

## Visão geral

Agência de sites integrados ao Instagram + sistemas internos (módulos) para
pequenas e médias empresas do Simples Nacional. Dois produtos:

1. **Site institucional** (R$149/mês) — site conectado ao Instagram, feed
   atualiza automaticamente
2. **Módulos internos** (R$99/módulo/mês) — CRM, estoque, contas a pagar/receber,
   fluxo de caixa, cadastros — à la carte, cliente escolhe o que precisa

Foco: organização interna e projetos, **sem marketing**. David não quer lidar
com esse lado.

---

## Infraestrutura

| Peça | Detalhe |
|---|---|
| **Repositório** | `github.com/davidbrochini-web/webstudio-` (nota o hífen no final do nome) |
| **Deploy** | Vercel — `https://webstudio-red-eight.vercel.app/` (env var `NEXT_PUBLIC_WA_NUMBER` já configurada com número real: `5511991758573`) |
| **Banco** | Supabase — projeto `WebStudio`, ref `evlrrtwobsegggvykphr`, região São Paulo |
| **Stack** | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |

### Acesso à Vercel — confirmado nesta sessão
Deploy acontece automaticamente a cada push na `main`. Além disso, Claude
já testou e confirmou acesso via API (token de conta, ver seção de
credenciais) — consegue consultar projetos/deploys/domínios. Escrita
(alterar env var, forçar redeploy) não foi testada ainda, mas deveria
funcionar pela mesma API.

### Sobre os "3 projetos" do Supabase — não confundir
David tem 3 projetos Supabase na conta, mas são **3 produtos diferentes**
rodando em paralelo (`casosesquecidos`, `OmniPromo Admin`, `WebStudio`) —
não são 3 ambientes (dev/staging/prod) do mesmo produto webstudio. Dentro
do projeto `WebStudio` especificamente, por ora existe **um único ambiente**
(produção) — staging fica pra quando tiver o primeiro cliente real pagando,
não antes disso.

### Git — fluxo estabelecido
```
main      → produção, protegida (PR obrigatório, sem push direto — testado e confirmado)
staging   → homologação
feat/*    → features
fix/*     → correções
```
Todo PR passa por GitHub Actions CI (`.github/workflows/ci.yml`): type check + build.
Squash merge é o padrão usado.

### Credenciais — como cada uma é usada (todas testadas e confirmadas ativas)
- **GitHub fine-grained token**: Contents, Pull requests, Workflows, Administration,
  Metadata (Read/Write). Escopo: só o repo `webstudio-`. Testado ✓ (200, lê o repo).
  **Como gerar de novo quando expirar:** GitHub → Settings → Developer settings
  → Personal access tokens → Fine-grained tokens → Generate new → repositório
  `davidbrochini-web/webstudio-` → marcar as 5 permissões acima com "Read and write"
  (Metadata fica "Read-only", é obrigatório mas sem opção de write).
- **Supabase Personal Access Token (PAT)**: gerado em
  `supabase.com/dashboard/account/tokens`, formato `sbp_...`. Escopo: **conta
  inteira** (vê os 3 projetos Supabase do David). Usado para rodar SQL via
  **Management API** (ver seção abaixo) — não é a senha do banco. Testado ✓
  (200, lista os 3 projetos, WebStudio ACTIVE_HEALTHY).
- **Vercel token**: gerado em `vercel.com/account/tokens`, formato `vcp_...`.
  Escopo: **conta inteira** (vê os 3 projetos Vercel do David). Testado ✓ (200,
  lista os 3 projetos). Usado até agora só para leitura — escrita
  (env vars, redeploy) não testada ainda nesta sessão, mas a API suporta.
- **Senha do banco Postgres**: existe, mas **não é usada** — ver limitação de rede.

---

## ⚠️ Limitação crítica de ambiente: sem conexão direta de banco

O ambiente onde Claude executa código (sandbox) **só tem saída de rede em
HTTPS/porta 443**. Conexão direta Postgres (porta 5432) ou pooler (porta 6543)
**não funciona daqui** — timeout, independente de credencial ou método
(direct connection, session pooler, transaction pooler — todos testados e
todos falham por bloqueio de porta, não por erro de configuração).

**Solução adotada: Supabase Management API.**
Para rodar SQL (migrations, queries administrativas), usa-se:

```
POST https://api.supabase.com/v1/projects/{ref}/database/query
Authorization: Bearer sbp_xxx...  (Personal Access Token da conta)
Content-Type: application/json
User-Agent: curl/8.5.0   ← IMPORTANTE, ver nota abaixo

Body: {"query": "<SQL aqui>"}
```

**Nota sobre User-Agent:** o Cloudflare do `api.supabase.com` bloqueia requisições
com User-Agent genérico de bibliotecas HTTP (Python urllib, etc) com erro
`403 / error code: 1010`. Usar `curl` diretamente ou forçar um User-Agent
tipo navegador/curl resolve.

**Se uma sessão futura tiver acesso de rede diferente** (porta 5432 liberada),
`psql` direto também funciona normalmente — foi testado localmente com sucesso
antes de identificar essa limitação. Não assumir que a limitação persiste sem
testar de novo.

---

## Banco de dados — schema aplicado (produção, confirmado)

**3 migrations aplicadas com sucesso no Supabase real:**

```
supabase/migrations/
├── 0001_core_platform.sql    → tenants, profiles, memberships, subscriptions
├── 0002_cadastros.sql        → funcionarios, produtos_servicos, clientes, fornecedores
└── 0003_cadastros_rls.sql    → políticas RLS do módulo de cadastros
```

### ⚠️ Ao reaplicar ou usar 0001 em produção
O arquivo `0001_core_platform.sql` no repo contém um **stub de `auth.users` e
`auth.uid()` só para teste local** (linhas com o comentário "Só existem aqui
para permitir testar a migration localmente"). **Esse trecho NUNCA deve rodar
em produção** — sobrescreveria a função `auth.uid()` real do Supabase.
Antes de aplicar em qualquer projeto Supabase real, remover esse bloco
(era da linha 10 à 19 na versão testada; confirmar antes de reusar).
Ficou registrado como `0001_production.sql` (gerado, não versionado) na
sessão em que foi aplicado — se precisar reaplicar, gerar de novo removendo
o stub, não usar o arquivo `0001_core_platform.sql` puro contra o Supabase real.

### Estrutura confirmada em produção (8 tabelas, RLS ativo em todas)

**Núcleo multi-tenant:**
- `tenants` — cada empresa cliente
- `profiles` — 1:1 com `auth.users`, campo `is_super_admin` (true só pra David)
- `memberships` — liga user↔tenant + papel (`owner`/`admin`/`operador`)
- `subscriptions` — quais módulos cada tenant assina

**Módulo Cadastros:**
- `funcionarios`, `produtos_servicos`, `clientes`, `fornecedores`
- Cliente e fornecedor em tabelas **separadas** de propósito (evoluções diferentes:
  cliente ganha histórico/crédito, fornecedor ganha prazo/condição de pagamento)
- Toda tabela tem: `created_at`, `updated_at`, `created_by`, `deleted_at` (soft-delete)

### Regra de acesso (RLS)
- Qualquer membro do tenant lê (`select`)
- Só `owner`/`admin` cria/edita/exclui — `operador` é leitura (testado: bloqueio
  vem do próprio banco, não do código)
- `is_super_admin() = true` (David) enxerga e edita qualquer tenant sem precisar
  de membership

### 🐛 Gotcha de RLS documentado (não repetir)
Tentativa inicial: colocar `deleted_at is null` dentro da política de **SELECT**
pra esconder registro excluído automaticamente. **Isso quebra o UPDATE que faz
o soft-delete** — Postgres exige que a política de SELECT e a de UPDATE passem
juntas (AND) na linha *resultante*, e marcar `deleted_at = now()` faz a linha
falhar a própria regra de visibilidade no meio da operação.

**Correção aplicada:** RLS cuida só de segurança (tenant certo, papel certo).
Esconder registro excluído é filtro de **query da aplicação**, não do RLS:
```ts
.select('*').eq('tenant_id', t).is('deleted_at', null)  // sempre incluir isso
```

### Testes de isolamento realizados (Postgres local, antes de aplicar em produção)
- Tenant A não vê dado do tenant B ✓
- Operador bloqueado de criar/editar pelo banco ✓
- Owner consegue criar normalmente ✓
- Super-admin vê todos os tenants sem membership ✓
- Soft-delete funciona após correção do gotcha acima ✓

---

## Frontend — o que está no ar

### Landing page da agência (`/`)
Hero, feed Instagram simulado (horizontal, full-bleed), "Como funciona",
seção de templates ("Esse site pode ser seu"), features, módulos, pricing
(2 cards: site R$149 | módulos R$99 cada), CTA final. **Dark mode real**
implementado (toggle sol/lua no Navbar, persiste em localStorage, sem flash
no load).

### 7 templates de nicho (`/modelos/[nicho]`) — arquétipos de página inteira, não reskin de cor
Cada nicho tem **estrutura de página própria** (componente em `components/layouts/`),
não é hero-diferente-resto-igual:

| Nicho | Arquétipo | Estrutura característica |
|---|---|---|
| Clínica odontológica | `ClinicoLayout` | Hero split, barra de confiança, serviços em lista horizontal, 1 depoimento grande |
| Advocacia | `EditorialLayout` | Fundo escuro, áreas de atuação em sidebar numerada, depoimento em texto puro sem card |
| Estúdio de fotografia | `PortfolioLayout` | Hero **é** mosaico de fotos, serviços como cards com foto de fundo |
| Barbearia/Salão | `UrbanoLayout` | Hero diagonal, serviços em formato de cardápio com preço, galeria escalonada |
| Academia/Personal | `PerformanceLayout` | Número gigante sobreposto no hero, ficha de treino com barra de progresso, antes/depois |
| Clínica de massagem | `ZenLayout` | Coluna única, zero grid, galeria vem antes de tudo, só 1 depoimento, CTA tipo link |
| Escola/Curso | `AcolhedorLayout` | Cards arredondados com foto no topo, blob decorativo, CTA em pílula |

Config de cada nicho (textos, cores, `pageLayout`, `photoIds`) centralizada em
`lib/templates.ts` — um único "banco de dados" de nicho, os 7 componentes de
layout consomem essa config.

### Fotos — solução adotada
Testamos 3 abordagens, na ordem:
1. ❌ **LoremFlickr** (busca por palavra-chave) — resultado ruim e instável,
   fotos fora de tema ou quebradas
2. ❌ **Picsum genérico** — sempre carrega, mas fotos sem relação com o nicho
   (ex: ponte, paisagem aleatória — não vende o produto)
3. ✅ **Unsplash curado manualmente** — 2-3 fotos reais por nicho, escolhidas
   a dedo (busca no Unsplash → verifica licença livre → extrai URL do CDN via
   `images.unsplash.com/photo-{id}`), ciclando entre elas pra variar
   (`lib/photos.ts`: `unsplashPhoto()` / `unsplashPhotoFrom()`)

**Limitação conhecida:** 2-3 fotos por nicho ainda é pouco pra um feed de 8
posts parecer 100% real — repete dentro do próprio feed. Para nichos que
virarem prioridade de venda, vale garimpar mais fotos manualmente (mesmo
processo: buscar no Unsplash, confirmar "Free to use under the Unsplash
License", extrair URL do CDN).

Fotos são só para **demonstração** — cliente real substitui pela foto do
próprio negócio quando fechar contrato.

### Bugs encontrados e corrigidos nesta fase
- WhatsApp hardcoded no Navbar e CtaFinal (só esses 2 componentes não liam
  a env var `NEXT_PUBLIC_WA_NUMBER`) — corrigido
- Feed horizontal com "buraco" em telas largas (alinhamento à esquerda sem
  centralizar quando cabe) — corrigido com `justify-center lg:`
- Layout Zen (massagem) com excesso de espaço vazio — reformulado com fotos
  maiores, faixa full-bleed, cards com foto

---

## Decisões de produto tomadas

- **Não** vamos oferecer "massagem sensual" ou qualquer serviço adulto —
  risco real de bloqueio pelo Asaas (processador de pagamento), Meta
  (derrubaria a integração Instagram) e Vercel. Um único cliente desse tipo
  pode suspender a conta inteira e derrubar todos os outros clientes junto.
  Escopo do nicho massagem é **terapêutico** (massoterapia, relaxante,
  drenagem, pedras quentes, gestante).
- Cliente e fornecedor em tabelas separadas (não uma tabela `contatos` genérica)
- Cadastros foi o primeiro módulo — fundação pra todos os outros referenciarem
- David cria as contas dos clientes manualmente após contrato fechado (sem
  auto-cadastro)
- Existe painel super-admin (David vê/controla todos os tenants) separado
  do painel de cada cliente

## Painel super-admin — status real (atualizado)

**Já construído e em produção (main):**
- **Etapa 1**: autenticação (`/login`), `proxy.ts` protegendo `/admin` e `/app`
  por sessão + papel (`is_super_admin`)
- **Etapa 2**: gestão de tenants (`/admin/tenants`) — criar/editar/mudar status
- **Etapa 3**: usuários do cliente (`/admin/tenants/[id]`) — criar login do
  cliente (via `service_role`), atribuir papel, ativar/desativar módulos
  (`subscriptions`)

**Ainda não construído:**
- **Painel do cliente** (`/app`) — hoje é só esqueleto, falta CRUD visual de
  Cadastros (primeiro módulo vendável)
- CRM, estoque, contas a pagar/receber, fluxo de caixa

**Próximos passos:**
1. **Painel do cliente** — CRUD de Cadastros
2. **Criar app da Meta for Developers** — ainda pendente do lado do David.
   Aprovação leva 5-15 dias úteis, não depende do código estar pronto.
   Recomendado fazer em paralelo o quanto antes.
3. **Integração real Instagram Graph API** — deixada por último de propósito
   (é a única dependência externa relevante do produto)
4. **Asaas (cobrança)** — entra quando houver primeiro contrato real
5. Staging separada no Supabase — não urgente com zero cliente pagante;
   criar quando tiver primeiro cliente real em produção

## Auditoria de segurança — correções aplicadas (sessão de revisão)

Revisão completa de código + banco + deploy encontrou e corrigiu:

- **🔴 `createTenantUser` sem checagem de permissão**: essa server action usa
  `service_role` (bypassa RLS) para criar login de cliente. Como server
  actions viram endpoints POST expostos — `proxy.ts` protege a *página*,
  não a action — qualquer um que descobrisse o endpoint podia criar
  usuários/memberships em qualquer tenant. **Corrigido**: guard
  `requireSuperAdmin()` (`lib/supabase/guards.ts`) checado antes de
  qualquer operação com o client admin.
- **🔴 Sem rollback em `createTenantUser`**: se `profile` ou `membership`
  falhassem depois do usuário já criado no Auth, ficava órfão e bloqueava
  o e-mail pra sempre. **Corrigido**: `deleteUser()` em qualquer falha após
  a criação do login.
- **🟡 `SUPABASE_SERVICE_ROLE_KEY` exposta em `preview` na Vercel**: qualquer
  deploy de preview de branch rodava com a chave que bypassa todo RLS.
  **Corrigido**: restrita a `production` apenas.
- **Validação de `papel`/`plano`**: aceitavam qualquer string, só validado
  na aplicação. **Corrigido**: whitelist na aplicação + `CHECK` constraint
  no banco (`0006_constraints_validacao.sql`, aplicada em produção) —
  protege também contra escrita direta via SQL/Management API.

**Backlog registrado (não corrigido nesta sessão, por decisão consciente):**
- Convite por e-mail em vez de admin definir senha do cliente (fase 2)
- Sem rate limit/captcha dedicado no `/login` (Supabase já limita auth)
- 2 erros de `eslint` pré-existentes (`react-hooks/set-state-in-effect` em
  `ThemeToggle.tsx` e `TenantUsersManager.tsx`) — não bloqueiam CI (que só
  roda `tsc` + `build`, sem lint), mas valem correção numa próxima sessão

---

## Convenções de código estabelecidas

- Todo componente com link de WhatsApp usa
  `` `https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER ?? '55XXXXXXXXXXX'}` ``
  — nunca hardcoded
- CSS: variáveis customizadas em `globals.css` (`--ink`, `--page-bg`,
  `--card-bg`, `--muted`, `--border`, `--off`) que trocam de valor com a
  classe `.dark` no `<html>` — dark mode é CSS var, não Tailwind `dark:`
  utility
- Migrations SQL numeradas (`0001_`, `0002_`...), sempre testadas localmente
  (Postgres 16 disponível no ambiente) antes de aplicar em produção
- Fluxo de branch sempre: `feat/fix` → push → PR via API → squash merge →
  delete branch remota
