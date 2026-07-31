'use client'

import { useActionState, useState, useEffect } from 'react'

interface Artigo {
  id: string
  titulo: string
  slug: string
  resumo: string | null
  conteudo: string | null
  capa_url: string | null
  alt_text: string | null
  meta_titulo: string | null
  meta_descricao: string | null
  publicado: boolean
  created_at: string
}

interface PEFormState { error?: string; success?: boolean }

type Acao = (prev: PEFormState, fd: FormData) => Promise<PEFormState>

function slugify(txt: string) {
  return txt.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

function Form({ siteId, artigo, onCancel, upsertAction }: {
  siteId: string
  artigo?: Artigo
  onCancel: () => void
  upsertAction: Acao
}) {
  const [state, formAction, pending] = useActionState<PEFormState, FormData>(upsertAction, {})
  const [titulo, setTitulo] = useState(artigo?.titulo ?? '')
  const [slug, setSlug] = useState(artigo?.slug ?? '')
  const [slugManual, setSlugManual] = useState(!!artigo)

  // Slug deriva do título só enquanto o usuário não editou manualmente.
  // Calculado direto no onChange do título (não em useEffect) pra evitar
  // o "setState síncrono dentro de effect" — cascata de renders extra
  // sem necessidade, já que não há nada assíncrono ou externo aqui.
  function onTituloChange(v: string) {
    setTitulo(v)
    if (!slugManual) setSlug(slugify(v))
  }

  useEffect(() => {
    if (state.success) onCancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success])

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="site_id" value={siteId} />
      {artigo && <input type="hidden" name="id" value={artigo.id} />}

      {/* Título grande como editor real */}
      <div>
        <input
          name="titulo" value={titulo} onChange={e => onTituloChange(e.target.value)} required
          placeholder="Título do artigo"
          className="w-full text-2xl font-display font-bold text-[var(--ink)] bg-transparent border-0 border-b-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none pb-2 placeholder:text-[var(--border)] transition-colors"
        />
      </div>

      {/* Slug */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--muted)] font-mono flex-shrink-0">/artigos/</span>
        <input
          name="slug" value={slug}
          onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
          required placeholder="slug-do-artigo"
          className="flex-1 text-xs font-mono text-[var(--muted)] bg-[var(--off)] border border-[var(--border)] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
        />
        {slugManual && (
          <button type="button" onClick={() => { setSlug(slugify(titulo)); setSlugManual(false) }}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] px-2">↺</button>
        )}
      </div>

      {/* Resumo */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
          Resumo <span className="text-[var(--muted)] normal-case font-normal">(aparece no card da home)</span>
        </label>
        <textarea name="resumo" defaultValue={artigo?.resumo ?? ''} required rows={2}
          placeholder="Uma ou duas frases que resumem o artigo"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none transition-all" />
      </div>

      {/* Conteúdo */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
          Conteúdo completo
        </label>
        <textarea name="conteudo" defaultValue={artigo?.conteudo ?? ''} required rows={12}
          placeholder="Escreva o artigo aqui. Pode usar parágrafos, listas e quebras de linha normalmente."
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--page-bg)] text-sm text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-y transition-all leading-relaxed font-mono" />
      </div>

      {/* Imagem de capa */}
      <div className="grid grid-cols-2 gap-4 p-5 bg-[var(--off)] rounded-2xl">
        <div className="col-span-2">
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">Imagem de capa</p>
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1.5">URL da imagem</label>
          <input name="capa_url" type="url" defaultValue={artigo?.capa_url ?? ''} placeholder="https://..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
        </div>
        <div>
          <label className="block text-xs text-[var(--muted)] mb-1.5">Descrição (acessibilidade)</label>
          <input name="alt_text" defaultValue={artigo?.alt_text ?? ''} placeholder="O que aparece na foto"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
        </div>
      </div>

      {/* SEO + publicação */}
      <div className="grid grid-cols-2 gap-4 p-5 bg-[var(--off)] rounded-2xl">
        <div className="col-span-2">
          <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">SEO e publicação</p>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-[var(--muted)] mb-1.5">Título para o Google</label>
          <input name="meta_titulo" defaultValue={artigo?.meta_titulo ?? ''}
            placeholder="Se vazio, usa o título do artigo"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-[var(--muted)] mb-1.5">Descrição para o Google</label>
          <textarea name="meta_descricao" defaultValue={artigo?.meta_descricao ?? ''} rows={2}
            placeholder="Até 160 caracteres"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none transition-all" />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" name="publicado" defaultChecked={artigo?.publicado ?? false}
              className="w-4 h-4 accent-[var(--brand)]" />
            <span className="text-sm font-semibold text-[var(--ink)]">Publicar no site</span>
            <span className="text-xs text-[var(--muted)]">(desmarcado = rascunho)</span>
          </label>
        </div>
      </div>

      {state.error && (
        <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{state.error}</p>
      )}

      <div className="flex gap-3 pb-4">
        <button type="submit" disabled={pending}
          className="bg-[var(--brand)] hover:opacity-90 disabled:opacity-60 text-white font-bold text-sm px-8 py-3 rounded-xl transition-opacity shadow-sm">
          {pending ? 'Salvando…' : artigo ? 'Salvar alterações' : 'Publicar artigo'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)] px-5 py-3 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default function BlogEditor({ siteId, artigos, upsertAction, deleteAction }: {
  siteId: string
  artigos: Artigo[]
  upsertAction: Acao
  deleteAction: (id: string) => Promise<void>
}) {
  const [view, setView] = useState<'list' | 'new' | Artigo>('list')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (view === 'new' || (view !== 'list' && typeof view === 'object')) {
    return (
      <Form
        siteId={siteId}
        artigo={typeof view === 'object' ? view : undefined}
        onCancel={() => setView('list')}
        upsertAction={upsertAction}
      />
    )
  }

  return (
    <div>
      <button
        onClick={() => setView('new')}
        className="mb-6 flex items-center gap-2 bg-[var(--brand)] hover:opacity-90 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-opacity shadow-sm"
      >
        <span className="text-lg leading-none">✍️</span> Escrever novo artigo
      </button>

      {artigos.length === 0 ? (
        <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-16 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-display font-bold text-[var(--ink)] text-lg mb-1">Nenhum artigo ainda</p>
          <p className="text-[var(--muted)] text-sm">Publique dicas e novidades da clínica — aparecem na seção &ldquo;Novidades&rdquo; do site.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {artigos.map(a => (
            <div key={a.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex items-start gap-4 hover:border-[var(--brand)]/40 transition-colors">
              {a.capa_url && (
                <img src={a.capa_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-[var(--ink)] text-base truncate">{a.titulo}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    a.publicado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
                {a.resumo && <p className="text-sm text-[var(--muted)] line-clamp-2">{a.resumo}</p>}
                <p className="text-xs text-[var(--muted)] mt-1.5">
                  {new Date(a.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setView(a)}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--brand)] px-3 py-1.5 rounded-lg hover:bg-[var(--off)] transition-all">
                  Editar
                </button>
                {confirmDelete === a.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={async () => { await deleteAction(a.id); setConfirmDelete(null) }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50">
                      Confirmar
                    </button>
                    <button onClick={() => setConfirmDelete(null)} className="text-xs text-[var(--muted)] px-2 py-1.5">Não</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmDelete(a.id)}
                    className="text-xs text-[var(--muted)] hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
