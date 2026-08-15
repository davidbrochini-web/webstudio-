import { ImageResponse } from 'next/og'
import { buscarPostPorSlug } from '@/lib/blog-omnidesign'

export const runtime = 'edge'
export const alt = 'Omnidesign — Blog'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  const post = await buscarPostPorSlug(params.slug)
  const titulo = post?.titulo ?? 'Omnidesign'
  const categoria = post?.categoria

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          background: '#05070A',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7FA33E, #4FB8C4)',
            opacity: 0.25,
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #7FA33E, #4FB8C4)',
              display: 'flex',
            }}
          />
          <span style={{ fontSize: 34, fontWeight: 800, color: 'white', letterSpacing: -1 }}>
            omnidesign
          </span>
        </div>
        {categoria && (
          <span style={{ fontSize: 22, fontWeight: 700, color: '#4FB8C4', marginBottom: 14, display: 'flex' }}>
            {categoria.toUpperCase()}
          </span>
        )}
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            maxWidth: 980,
            display: 'flex',
          }}
        >
          {titulo}
        </div>
      </div>
    ),
    { ...size }
  )
}
