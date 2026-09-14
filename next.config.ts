import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Skew Protection real: Turbopack (Next 16) NÃO usa content-hash no
  // nome dos chunks (confirmado empiricamente — mudar o conteúdo de um
  // CSS não muda o nome do arquivo gerado). A Vercel cacheia
  // `/_next/static/immutable/` como imutável pra sempre, então sem
  // isso um deploy novo podia nunca chegar no navegador: o edge
  // continuava servindo o JS/CSS do deploy anterior sob o mesmo nome
  // de arquivo (foi exatamente o que aconteceu com o @import de fontes
  // removido no commit 57db6b8 — ficou no ar por >2h depois do deploy
  // "concluído"). `deploymentId` faz o Next anexar `?dpl=<id>` em todo
  // asset, criando uma cache key única por deploy mesmo quando o nome
  // do arquivo não muda.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'evlrrtwobsegggvykphr.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

// withSentryConfig só faz upload de source maps (pra ver stack trace
// legível, não minificado) quando SENTRY_AUTH_TOKEN existe — sem ele,
// o build funciona normal, só sem essa parte extra. silent evita
// poluir o log de build com avisos do Sentry enquanto o token não
// estiver configurado.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
});
