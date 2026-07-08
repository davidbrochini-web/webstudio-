const stats = [
  { value: '48h',   label: 'do contrato ao site no ar' },
  { value: '0',     label: 'trabalho extra após a configuração' },
  { value: '100%',  label: 'automático — sem painel extra' },
]

export default function Stats() {
  return (
    <div className="bg-[var(--off)] border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-6 py-7 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-0 sm:divide-x sm:divide-[var(--border)]">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center sm:px-8">
            <span className="font-display font-extrabold text-3xl text-[var(--ink)] block leading-none">
              {value}
            </span>
            <span className="text-sm text-[var(--muted)] mt-1 block">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
