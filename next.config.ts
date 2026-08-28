import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
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
