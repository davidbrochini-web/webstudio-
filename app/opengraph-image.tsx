import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Omnidesign — Sites inteligentes conectados ao Instagram + sistemas internos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
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
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.15,
            maxWidth: 900,
            display: 'flex',
          }}
        >
          Sites inteligentes conectados ao Instagram
        </div>
        <div
          style={{
            fontSize: 26,
            color: 'rgba(255,255,255,0.55)',
            marginTop: 24,
            maxWidth: 780,
            display: 'flex',
          }}
        >
          + sistemas internos que organizam sua empresa. Tudo automatizado.
        </div>
      </div>
    ),
    { ...size }
  )
}
