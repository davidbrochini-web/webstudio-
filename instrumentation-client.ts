import * as Sentry from '@sentry/nextjs'

// Mesmo padrão do lib/email.ts: sem SENTRY_DSN configurado (dev
// local, preview sem env, ou antes do David criar a conta), o
// Sentry.init simplesmente não reporta nada — nunca quebra o app.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Session Replay ligado só quando algo dá erro — volume baixo,
  // ajuda a ver exatamente o que o usuário fez antes do bug.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
