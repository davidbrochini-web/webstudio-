export default function PageBanner({ title, imageUrl }: { title: string; imageUrl?: string | null }) {
  return (
    <section className="relative px-6 py-24 text-center overflow-hidden">
      {imageUrl && (
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-sm scale-110" />
      )}
      <div className="absolute inset-0 bg-[#0B2B3C]/80" />
      <h1 className="relative font-display font-extrabold text-3xl sm:text-4xl text-white">{title}</h1>
    </section>
  )
}
