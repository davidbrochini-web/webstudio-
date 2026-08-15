'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarPost, atualizarPost, apagarPost } from '@/app/admin/blog/actions'
import { slugify, type BlogPostOmnidesign } from '@/lib/blog-omnidesign-shared'

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function BlogPostForm({ post }: { post?: BlogPostOmnidesign }) {
  const router = useRouter()
  const isEdit = Boolean(post)

  const [titulo, setTitulo] = useState(post?.titulo ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(isEdit)
  const [resumo, setResumo] = useState(post?.resumo ?? '')
  const [conteudo, setConteudo] = useState(post?.conteudo ?? '')
  const [categoria, setCategoria] = useState(post?.categoria ?? '')
  const [status, setStatus] = useState<'rascunho' | 'publicado'>(post?.status ?? 'rascunho')
  const [publicadoEm, setPublicadoEm] = useState(toDatetimeLocal(post?.publicado_em ?? null))
  const [seoAberto, setSeoAberto] = useState(false)
  const [metaTitulo, setMetaTitulo] = useState(post?.meta_titulo ?? '')
  const [metaDescricao, setMetaDescricao] = useState(post?.meta_descricao ?? '')

  const [salvando, setSalvando] = useState(false)
  const [apagando, setApagando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleTituloChange(v: string) {
    setTitulo(v)
    if (!slugEditadoManualmente) setSlug(slugify(v))
  }

  async function handleSalvar() {
    setErro(null)
    if (!titulo.trim()) return setErro('Título é obrigatório.')
    if (status === 'publicado' && !publicadoEm) {
      return setErro('Post publicado precisa de data de publicação (pode ser agora ou uma data futura pra agendar).')
    }
    setSalvando(true)
    const input = {
      titulo,
      slug,
      resumo,
      conteudo,
      categoria: categoria || undefined,
      status,
      publicado_em: publicadoEm ? new Date(publicadoEm).toISOString() : null,
      meta_titulo: metaTitulo || undefined,
      meta_descricao: metaDescricao || undefined,
    }
    const result = isEdit ? await atualizarPost(post!.id, input) : await criarPost(input)
    setSalvando(false)
    if (result.error) return setErro(result.error)
    router.push('/admin/blog')
    router.refresh()
  }

  const [confirmandoApagar, setConfirmandoApagar] = useState(false)

  async function apagarDeVerdade() {
    if (!post) return
    setApagando(true)
    setErro(null)
    const result = await apagarPost(post.id)
    setApagando(false)
    if (result.error) return setErro(result.error)
    router.push('/admin/blog')
    router.refresh()
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-6 max-w-3xl">
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Título</label>
          <input
            value={titulo}
            onChange={e => handleTituloChange(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]"
            placeholder="Ex: Google Ads pra pequena empresa: vale a pena?"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">
            Slug (URL) — omnidesign.com.br/blog/<span className="text-[var(--ink)]">{slug || '...'}</span>
          </label>
          <input
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugEditadoManualmente(true) }}
            className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Resumo (aparece na listagem e no Google)</label>
          <textarea
            value={resumo}
            onChange={e => setResumo(e.target.value)}
            rows={2}
            className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">
            Conteúdo — um parágrafo por linha em branco vira um parágrafo no post
          </label>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            rows={14}
            className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-[var(--brand)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Categoria (opcional)</label>
            <input
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              placeholder="Ex: Marketing Digital"
              className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'rascunho' | 'publicado')}
              className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] bg-white"
            >
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
            </select>
          </div>
        </div>

        {status === 'publicado' && (
          <div>
            <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">
              Data e hora de publicação — no futuro = agendado, fica escondido até chegar a hora
            </label>
            <input
              type="datetime-local"
              value={publicadoEm}
              onChange={e => setPublicadoEm(e.target.value)}
              className="w-full sm:w-auto border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]"
            />
          </div>
        )}

        <div className="border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={() => setSeoAberto(v => !v)}
            className="text-xs font-semibold text-[var(--brand)] flex items-center gap-1.5"
          >
            SEO (opcional) {seoAberto ? '▲' : '▼'}
          </button>
          {seoAberto && (
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Título pra busca (se vazio, usa o título normal)</label>
                <input
                  value={metaTitulo}
                  onChange={e => setMetaTitulo(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] mb-1.5 block">Descrição pra busca (se vazio, usa o resumo)</label>
                <textarea
                  value={metaDescricao}
                  onChange={e => setMetaDescricao(e.target.value)}
                  rows={2}
                  className="w-full border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--brand)] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {erro && <p className="text-sm text-red-500">{erro}</p>}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-[var(--dark)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar post'}
            </button>
            <button
              onClick={() => router.push('/admin/blog')}
              className="text-sm font-semibold text-[var(--muted)] px-4 py-3 hover:text-[var(--ink)] transition-colors"
            >
              Cancelar
            </button>
          </div>

          {isEdit && (
            confirmandoApagar ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Tem certeza?</span>
                <button
                  onClick={apagarDeVerdade}
                  disabled={apagando}
                  className="text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  {apagando ? 'Apagando...' : 'Sim, apagar'}
                </button>
                <button
                  onClick={() => setConfirmandoApagar(false)}
                  className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmandoApagar(true)}
                className="text-xs font-semibold text-red-500 hover:text-red-600"
              >
                Apagar post
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
