import { themedPhoto } from '@/lib/photos'

interface Props {
  photoKeywords: string
  businessName: string
}

export default function GalleryStrip({ photoKeywords, businessName }: Props) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--dark)] text-center mb-3">
          Conheça o espaço
        </h2>
        <p className="text-center text-sm text-[var(--muted)] mb-10">
          Um ambiente pensado para você se sentir em casa na {businessName}.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <img
            src={themedPhoto(photoKeywords, 20, 700, 900)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl sm:translate-y-4"
          />
          <img
            src={themedPhoto(photoKeywords, 21, 700, 900)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl"
          />
          <img
            src={themedPhoto(photoKeywords, 22, 700, 900)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl sm:translate-y-4"
          />
        </div>
      </div>
    </section>
  )
}
