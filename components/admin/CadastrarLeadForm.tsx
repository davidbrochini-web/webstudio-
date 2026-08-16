'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createLeadPotencial, updateLeadPdfs, type LeadFormState } from '@/app/admin/crm/actions'
import { uploadLeadPdf } from '@/lib/storage'

export default function CadastrarLeadForm() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<LeadFormState, FormData>(createLeadPotencial, {})
  const formRef = useRef<HTMLFormElement>(null)

  // PDFs precisam do id do lead pra ter path de upload — então o
  // formulário cria o lead primeiro (sem PDF), e SÓ DEPOIS libera os
  // dois campos de upload, já apontando pro lead recém-criado.
  const [leadCriadoId, setLeadCriadoId] = useState<string | null>(null)
  const [uploadingAnalise, setUploadingAnalise] = useState(false)
  const [uploadingProposta, setUploadingProposta] = useState(false)
  const [analiseNome, setAnaliseNome] = useState<string | null>(null)
  const [propostaNome, setPropostaNome] = useState<string | null>(null)
  const [erroUpload, setErroUpload] = useState<string | null>(null)

  useEffect(() => {
    if (state.success && state.id) {
      setLeadCriadoId(state.id)
    }
  }, [state.success, state.id])

  async function handleUploadPdf(tipo: 'analise' | 'proposta', file: File) {
    if (!leadCriadoId) return
    setErroUpload(null)
    const setUploading = tipo === 'analise' ? setUploadingAnalise : setUploadingProposta
    setUploading(true)
    try {
      const url = await uploadLeadPdf(leadCriadoId, tipo, file)
      await updateLeadPdfs(leadCriadoId, tipo === 'analise' ? 'analise_pdf_url' : 'proposta_pdf_url', url)
      if (tipo === 'analise') setAnaliseNome(file.name)
      else setPropostaNome(file.name)
    } catch (err) {
      setErroUpload(err instanceof Error ? err.message : 'Erro ao enviar PDF.')
    } finally {
      setUploading(false)
    }
  }

  if (leadCriadoId) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-2xl">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-display font-bold text-[var(--ink)] mb-1">Lead cadastrado!</p>
        <p className="text-sm text-[var(--muted)] mb-6">
          Se já tiver os documentos, pode subir agora — ou fazer isso depois em &ldquo;Gerenciar Leads&rdquo;.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {([['analise', 'PDF de análise', analiseNome, uploadingAnalise], ['proposta', 'PDF de proposta', propostaNome, uploadingProposta]] as const).map(
            ([tipo, label, nomeArquivo, uploading]) => (
              <div key={tipo}>
                <p className="text-xs font-semibold text-[var(--muted)] mb-2">{label}</p>
                <label className="flex items-center justify-center text-center cursor-pointer text-sm font-semibold text-[var(--brand)] border border-dashed border-[var(--border)] rounded-xl py-4 px-3 hover:border-[var(--brand)] transition-colors">
                  {uploading ? 'Enviando...' : nomeArquivo ? `📄 ${nomeArquivo}` : '📎 Escolher PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadPdf(tipo, file)
                    }}
                  />
                </label>
              </div>
            )
          )}
        </div>
        {erroUpload && <p className="text-xs text-red-500 mb-4">{erroUpload}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/crm/leads-potenciais/gerenciar')}
            className="bg-[var(--dark)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Ir pra Gerenciar Leads →
          </button>
          <button
            onClick={() => {
              setLeadCriadoId(null)
              setAnaliseNome(null)
              setPropostaNome(null)
              formRef.current?.reset()
            }}
            className="bg-[var(--off)] text-[var(--ink)] font-semibold px-6 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--brand)] transition-colors"
          >
            Cadastrar outro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 max-w-2xl">
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <input
          name="nome"
          placeholder="Nome da empresa *"
          required
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="telefone"
            placeholder="Telefone / WhatsApp"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
          />
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>
        <input
          name="segmento"
          placeholder="Segmento (ex: dentista, advocacia)"
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            name="bairro"
            placeholder="Bairro"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
          />
          <input
            name="endereco"
            placeholder="Endereço"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none focus:border-[var(--brand)]"
          />
        </div>
        <textarea
          name="notas"
          placeholder="Observação"
          rows={2}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
        />
        <textarea
          name="texto_envio"
          placeholder="Texto que vai ser enviado pro lead (rascunho da mensagem/proposta)"
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--off)] text-sm outline-none resize-none focus:border-[var(--brand)]"
        />

        <p className="text-xs text-[var(--muted)] -mt-1">
          Upload de PDF de análise e proposta fica disponível depois de salvar o cadastro.
        </p>

        {state.error && <p className="text-xs text-red-500">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--dark)] text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? 'Salvando...' : '+ Cadastrar lead'}
        </button>
      </form>
    </div>
  )
}
