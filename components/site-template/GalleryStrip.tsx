import { unsplashPhotoFrom } from '@/lib/photos'

interface Props {
  photoIds: string[]
  businessName: string
}

export default function GalleryStrip({ photoIds, businessName }: Props) {
  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] text-center mb-3">
          Conheça o espaço
        </h2>
        <p className="text-center text-sm text-[var(--muted)] mb-10">
          Um ambiente pensado para você se sentir em casa na {businessName}.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <img
            src={unsplashPhotoFrom(photoIds, 0, 500, 650)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl sm:translate-y-4"
          />
          <img
            src={unsplashPhotoFrom(photoIds, 1, 700, 900)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl"
          />
          <img
            src={unsplashPhotoFrom(photoIds, 2, 500, 650)}
            alt=""
            loading="lazy"
            className="w-full aspect-[3/4] object-cover rounded-2xl sm:translate-y-4"
          />
        </div>
      </div>
    </section>
  )
}
