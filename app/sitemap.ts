import type { MetadataRoute } from 'next'

const BASE_URL = 'https://omnidesign.com.br'

// As 7 vitrines de /modelos/[nicho] são marcadas noindex de propósito
// (conteúdo quase-duplicado entre nichos, risco de canibalização) —
// não fazem sentido no sitemap junto com essa decisão.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
}
