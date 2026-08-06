/** Ondas decorativas que separam a seção de Áreas de Atuação do conteúdo
 *  acima, igual ao efeito visual do drfabiosato.com.br. O `flip` inverte
 *  pra usar também no final da seção (ondas pra baixo). */
export default function WaveDivider({
  fill = 'var(--dj-primary)',
  bg = 'white',
  flip = false,
}: {
  fill?: string
  bg?: string
  flip?: boolean
}) {
  return (
    <div
      className="w-full overflow-hidden leading-none"
      style={{ background: flip ? fill : bg }}
    >
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-16 sm:h-20"
        style={{ transform: flip ? 'scaleY(-1)' : undefined }}
      >
        <path
          fill={flip ? bg : fill}
          d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
        />
      </svg>
    </div>
  )
}
