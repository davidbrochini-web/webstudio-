'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSuperAdmin } from '@/lib/supabase/guards'
import { getNiche } from '@/lib/templates'
import { seedSiteFromNiche } from '@/lib/site-seed'
import { seedCadastrosDemo } from '@/lib/demo-cadastros-seed'
import { revalidatePath } from 'next/cache'

const STATUS_VALIDOS = ['novo', 'contatado', 'em_negociacao', 'sem_interesse', 'convertido', 'perdido']

export interface LeadFormState {
  error?: string
  success?: boolean
  id?: string
}

/**
 * Registra um evento no log do lead. Chamado internamente por outras
 * actions — nunca exposto direto pro client. Log é append-only, sem
 * update/delete (RLS só tem policy de select+insert).
 */
async function registrarEvento(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    leadId: string
    evento: 'lead_criado' | 'status_alterado' | 'proposta_gerada' | 'responsavel_alterado' | 'demo_criada'
    statusAnterior?: string | null
    statusNovo?: string | null
    detalhe?: string | null
    criadoPor?: string | null
  }
) {
  await supabase.from('leads_omnidesign_log').insert({
    lead_id: params.leadId,
    evento: params.evento,
    status_anterior: params.statusAnterior ?? null,
    status_novo: params.statusNovo ?? null,
    detalhe: params.detalhe ?? null,
    criado_por: params.criadoPor ?? null,
  })
}

/**
 * Atualiza o status de qualquer lead (site ou manual). RLS já
 * restringe UPDATE a super-admin, mas checamos aqui também pra dar
 * uma mensagem de erro decente em vez de um 42501 cru.
 *
 * Registra no log a transição (status_anterior -> status_novo) com
 * data e quem fez — pedido do David pra ter histórico completo, não
 * só a última mudança.
 */
export async function updateLeadStatus(id: string, status: string) {
  await requireSuperAdmin()

  if (!STATUS_VALIDOS.includes(status)) {
    throw new Error('Status inválido.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: atual } = await supabase.from('leads_omnidesign').select('status').eq('id', id).single()

  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  await registrarEvento(supabase, {
    leadId: id,
    evento: 'status_alterado',
    statusAnterior: atual?.status ?? null,
    statusNovo: status,
    criadoPor: user?.id,
  })

  revalidatePath('/admin/crm/leads-site')
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Cria um lead potencial (prospecção manual) — sempre origem='manual'.
 * Grava created_by com o id de quem cadastrou (pedido do David: saber
 * quem cadastrou cada lead, útil já que agora tem mais de uma pessoa
 * usando o admin).
 */
export async function createLeadPotencial(
  _prev: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  const nome = (formData.get('nome') as string)?.trim()
  const telefone = (formData.get('telefone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const segmento = (formData.get('segmento') as string)?.trim() || null
  const bairro = (formData.get('bairro') as string)?.trim() || null
  const endereco = (formData.get('endereco') as string)?.trim() || null
  const notas = (formData.get('notas') as string)?.trim() || null
  const texto_envio = (formData.get('texto_envio') as string)?.trim() || null

  if (!nome) {
    return { error: 'Nome da empresa é obrigatório.' }
  }

  const { data, error } = await supabase.from('leads_omnidesign').insert({
    nome,
    telefone,
    email,
    segmento,
    bairro,
    endereco,
    notas,
    texto_envio,
    origem: 'manual',
    status: 'novo',
    created_by: user.id,
  }).select('id').single()

  if (error) return { error: error.message }

  await registrarEvento(supabase, { leadId: data.id, evento: 'lead_criado', criadoPor: user.id })

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
  return { success: true, id: data.id }
}

/**
 * Atribui (ou remove) o responsável por tocar um lead — diferente de
 * created_by, que é fixo desde a criação. Qualquer super-admin pode
 * reatribuir (não só quem já é o responsável atual).
 */
export async function updateLeadResponsavel(id: string, responsavelId: string | null) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ responsavel_id: responsavelId })
    .eq('id', id)

  if (error) throw new Error(error.message)

  let nomeResponsavel: string | null = null
  if (responsavelId) {
    const { data: perfil } = await supabase.from('profiles').select('nome').eq('id', responsavelId).single()
    nomeResponsavel = perfil?.nome ?? null
  }

  await registrarEvento(supabase, {
    leadId: id,
    evento: 'responsavel_alterado',
    detalhe: nomeResponsavel ?? 'Sem responsável',
    criadoPor: user?.id,
  })

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Salva as URLs dos PDFs (análise/proposta) depois do upload no
 * client — o upload em si acontece direto no browser (mesmo padrão
 * de uploadSiteFoto), essa action só grava a URL resultante.
 */
export async function updateLeadPdfs(id: string, campo: 'analise_pdf_url' | 'proposta_pdf_url', url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ [campo]: url })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Gera o PDF de proposta automaticamente a partir dos dados do lead
 * (nome, segmento, bairro, avaliação Google) + logo/fotos que o
 * comercial subiu antes. Renderiza no servidor com @react-pdf/renderer,
 * sobe pro bucket leads-pdfs e grava em proposta_pdf_url — mesmo
 * campo usado pelo upload manual, só que preenchido automaticamente.
 */
export async function gerarPropostaPdf(id: string): Promise<{ error?: string; url?: string }> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('nome, segmento, bairro, endereco, telefone, nota_google, avaliacoes_google, logo_url, imagens_portfolio, home_mockup_url, responsavel_id')
    .eq('id', id)
    .single()

  if (fetchError || !lead) return { error: 'Lead não encontrado.' }

  // Contato que aparece no final da proposta ("vamos marcar essa
  // conversa?") — o responsável atribuído ao lead, se tiver algum.
  // Sem responsável definido, cai no contato genérico da Omnidesign.
  let responsavelNome: string | null = null
  let responsavelEmail: string | null = null
  if (lead.responsavel_id) {
    const { data: perfil } = await supabase
      .from('profiles')
      .select('nome')
      .eq('id', lead.responsavel_id)
      .single()
    if (perfil) {
      responsavelNome = perfil.nome
      const admin = createAdminClient()
      const { data: userData } = await admin.auth.admin.getUserById(lead.responsavel_id)
      responsavelEmail = userData.user?.email ?? null
    }
  }

  try {
    const { renderToBuffer } = await import('@react-pdf/renderer')
    const { default: PropostaDocument } = await import('@/components/pdf/PropostaDocument')

    const buffer = await renderToBuffer(
      PropostaDocument({
        lead: {
          nome: lead.nome,
          segmento: lead.segmento,
          bairro: lead.bairro,
          endereco: lead.endereco,
          telefone: lead.telefone,
          notaGoogle: lead.nota_google,
          avaliacoesGoogle: lead.avaliacoes_google,
          logoUrl: lead.logo_url,
          imagensPortfolio: lead.imagens_portfolio ?? [],
          homeMockupUrl: lead.home_mockup_url,
          responsavelNome,
          responsavelEmail,
        },
      })
    )

    const path = `${id}/proposta-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('leads-pdfs')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) return { error: `Erro ao salvar PDF: ${uploadError.message}` }

    const { data: signedData, error: signError } = await supabase.storage
      .from('leads-pdfs')
      .createSignedUrl(path, 60 * 60 * 24 * 365)

    if (signError || !signedData) return { error: `PDF gerado, mas erro ao criar link: ${signError?.message}` }

    const agora = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('leads_omnidesign')
      .update({ proposta_pdf_url: signedData.signedUrl, proposta_gerada_em: agora })
      .eq('id', id)

    if (updateError) return { error: `PDF gerado, mas erro ao salvar no lead: ${updateError.message}` }

    await registrarEvento(supabase, { leadId: id, evento: 'proposta_gerada', criadoPor: user?.id })

    revalidatePath('/admin/crm/leads-potenciais/gerenciar')
    return { url: signedData.signedUrl }
  } catch (err) {
    return { error: err instanceof Error ? `Erro ao gerar PDF: ${err.message}` : 'Erro ao gerar PDF.' }
  }
}

/**
 * Grava a URL do logo do lead (upload feito no client).
 */
export async function updateLeadLogo(id: string, url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign').update({ logo_url: url }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * JPG pronto de "como a home pode ficar", montado à mão pelo
 * atendente (Canva, Figma etc.) — alternativa à montagem automática
 * da página 4 da proposta (ver PropostaDocument.tsx). Upload feito
 * no client, essa action só registra a URL. `url: null` remove (pra
 * voltar a usar a montagem automática).
 */
export async function updateLeadHomeMockup(id: string, url: string | null) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign').update({ home_mockup_url: url }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Adiciona uma foto de portfólio (append no array) — upload feito
 * no client, essa action só registra a URL.
 */
export async function addLeadImagemPortfolio(id: string, url: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('imagens_portfolio')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const atual = lead?.imagens_portfolio ?? []
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ imagens_portfolio: [...atual, url] })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Remove uma foto de portfólio pelo índice.
 */
export async function removeLeadImagemPortfolio(id: string, index: number) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data: lead, error: fetchError } = await supabase
    .from('leads_omnidesign')
    .select('imagens_portfolio')
    .eq('id', id)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const atual = (lead?.imagens_portfolio ?? []) as string[]
  const nova = atual.filter((_, i) => i !== index)
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ imagens_portfolio: nova })
    .eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Busca o histórico de eventos de um lead, mais recente primeiro,
 * com nome de quem fez cada coisa.
 */
export async function getLeadLog(leadId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads_omnidesign_log')
    .select('id, evento, status_anterior, status_novo, detalhe, criado_em, autor:profiles!leads_omnidesign_log_criado_por_fkey ( nome )')
    .eq('lead_id', leadId)
    .order('criado_em', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
export async function updateLeadCampos(id: string, campos: { notas?: string; texto_envio?: string }) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update(campos)
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

export interface LeadDadosCompletos {
  nome: string
  telefone: string | null
  email: string | null
  segmento: string | null
  bairro: string | null
  endereco: string | null
  siteAtualUrl: string | null
  instagramUrl: string | null
  notas: string | null
}

/**
 * Atualiza os dados cadastrais do lead — usado pelo botão "Editar
 * cliente" no atendimento. Diferente de updateLeadCampos (que só
 * mexe em notas/texto_envio), esse cobre o cadastro inteiro:
 * identificação, contato, endereço e os dois campos novos (site
 * atual, Instagram).
 */
export async function updateLeadDadosCompletos(id: string, dados: LeadDadosCompletos): Promise<{ error?: string }> {
  try {
    await requireSuperAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const nome = dados.nome.trim()
  if (!nome) return { error: 'Nome da empresa é obrigatório.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({
      nome,
      telefone: dados.telefone?.trim() || null,
      email: dados.email?.trim() || null,
      segmento: dados.segmento?.trim() || null,
      bairro: dados.bairro?.trim() || null,
      endereco: dados.endereco?.trim() || null,
      site_atual_url: dados.siteAtualUrl?.trim() || null,
      instagram_url: dados.instagramUrl?.trim() || null,
      notas: dados.notas?.trim() || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
  return {}
}

/**
 * Soft-delete de um lead potencial (não usamos DELETE de verdade,
 * mesmo padrão do resto da plataforma — não existe policy de delete).
 */
export async function archiveLeadPotencial(id: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads_omnidesign')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

// ------------------------------------------------------------------
// FAQ por lead (0041) — script pré-definido por segmento +
// perguntas reais que o cliente fez, registradas pela Eliane (ou quem estiver no comercial).
// ------------------------------------------------------------------

export interface LeadFaqItem {
  id: string
  tipo: 'pre_definida' | 'pergunta_aberta'
  pergunta: string
  resposta: string
  ordem: number
  created_at: string
}

export async function getLeadFaq(leadId: string): Promise<LeadFaqItem[]> {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('leads_omnidesign_faq')
    .select('id, tipo, pergunta, resposta, ordem, created_at')
    .eq('lead_id', leadId)
    .order('tipo', { ascending: false }) // pre_definida antes de pergunta_aberta
    .order('ordem', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Popula o script pré-definido de um lead (usado uma vez ao gerar o
 * FAQ do segmento). Substitui qualquer pré-definida existente pra
 * evitar duplicar se rodar de novo.
 */
export async function setLeadFaqPreDefinida(
  leadId: string,
  itens: { pergunta: string; resposta: string }[]
) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { error: delError } = await supabase
    .from('leads_omnidesign_faq')
    .delete()
    .eq('lead_id', leadId)
    .eq('tipo', 'pre_definida')

  if (delError) throw new Error(delError.message)

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('leads_omnidesign_faq').insert(
    itens.map((item, i) => ({
      lead_id: leadId,
      tipo: 'pre_definida' as const,
      pergunta: item.pergunta,
      resposta: item.resposta,
      ordem: i,
      created_by: user?.id,
    }))
  )

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Registra uma pergunta real feita pelo cliente + a resposta (dada
 * pela pessoa do comercial com apoio do Claude no chat). Campo aberto do card.
 */
export async function addLeadFaqPerguntaAberta(
  leadId: string,
  pergunta: string,
  resposta: string
) {
  await requireSuperAdmin()

  if (!pergunta.trim() || !resposta.trim()) {
    throw new Error('Pergunta e resposta são obrigatórias.')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: max } = await supabase
    .from('leads_omnidesign_faq')
    .select('ordem')
    .eq('lead_id', leadId)
    .eq('tipo', 'pergunta_aberta')
    .order('ordem', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('leads_omnidesign_faq').insert({
    lead_id: leadId,
    tipo: 'pergunta_aberta',
    pergunta: pergunta.trim(),
    resposta: resposta.trim(),
    ordem: (max?.ordem ?? -1) + 1,
    created_by: user?.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

export async function deleteLeadFaqItem(id: string, leadId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const { error } = await supabase.from('leads_omnidesign_faq').delete().eq('id', id)

  if (error) throw new Error(error.message)

  void leadId
  revalidatePath('/admin/crm/leads-potenciais/gerenciar')
}

/**
 * Busca por similaridade (pg_trgm, sem IA) na base de conhecimento
 * (leads_faq_base_conhecimento) pra sugerir resposta pra uma pergunta
 * nova que o cliente fez. Retorna null se nada bateu o suficiente
 * (limiar 0.3, ver migration 0042) — quem estiver no comercial sempre revisa/edita
 * antes de salvar.
 */
export interface SugestaoFaq {
  resposta: string
  perguntaBase: string
  similaridade: number
}

export async function buscarSugestaoFaq(leadId: string, pergunta: string): Promise<SugestaoFaq | null> {
  await requireSuperAdmin()

  if (!pergunta.trim()) return null

  const supabase = await createClient()

  const { data: lead, error: leadError } = await supabase
    .from('leads_omnidesign')
    .select('segmento')
    .eq('id', leadId)
    .single()

  if (leadError) throw new Error(leadError.message)

  const { data, error } = await supabase.rpc('buscar_sugestao_faq', {
    p_segmento: lead?.segmento ?? null,
    p_pergunta: pergunta.trim(),
  })

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return null

  const match = data[0]
  return {
    resposta: match.resposta,
    perguntaBase: match.pergunta_base,
    similaridade: match.similaridade,
  }
}

/**
 * Demo ligada a lead: substitui o antigo /demo/iniciar público
 * (self-serve, sem limite — matou 45 tenants órfãos sem gerar 1
 * lead sequer, ver migration 0058). Agora só o atendente cria,
 * durante a negociação, e a demo já nasce amarrada ao lead —
 * quando o lead é marcado como perdido, a demo soft-deleta sozinha
 * (trigger) e é purgada em 7 dias (cron).
 *
 * Idempotente: se o lead já tem uma demo ativa (is_demo=true,
 * deleted_at is null), retorna o link existente em vez de criar
 * outra — evita duplicar ao clicar duas vezes.
 */
export interface DemoLeadResult {
  error?: string
  link?: string
  nicho?: string
}

export async function criarDemoParaLead(leadId: string, nichoSlug: string): Promise<DemoLeadResult> {
  await requireSuperAdmin()

  const niche = getNiche(nichoSlug)
  if (!niche) return { error: 'Modelo inválido.' }

  const admin = createAdminClient()

  const { data: existente } = await admin
    .from('tenants')
    .select('demo_token, nome')
    .eq('lead_id', leadId)
    .eq('is_demo', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (existente?.demo_token) {
    return {
      link: `https://webstudio-red-eight.vercel.app/demo/entrar?token=${existente.demo_token}`,
      nicho: existente.nome?.replace('Demo — ', '') ?? niche.label,
    }
  }

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({
      nome: `Demo — ${niche.label}`,
      plano: 'demo',
      status: 'ativo',
      is_demo: true,
      lead_id: leadId,
      demo_token: crypto.randomUUID(),
    })
    .select('id, demo_token')
    .single()

  if (tenantError || !tenant) {
    return { error: tenantError?.message ?? 'Erro ao criar a demo.' }
  }

  const randomId = Math.random().toString(36).slice(2, 8)
  const seedResult = await seedSiteFromNiche(admin, tenant.id, niche.slug, `demo-${randomId}`, 'publicado')

  if (seedResult.error || !seedResult.siteId) {
    await admin.from('tenants').delete().eq('id', tenant.id)
    return { error: seedResult.error ?? 'Erro ao montar o conteúdo do site.' }
  }

  const { error: subError } = await admin
    .from('subscriptions')
    .insert([
      { tenant_id: tenant.id, modulo: 'site', status: 'ativo' },
      { tenant_id: tenant.id, modulo: 'cadastros', status: 'ativo' },
    ])

  if (subError) {
    await admin.from('tenants').delete().eq('id', tenant.id)
    return { error: subError.message }
  }

  await seedCadastrosDemo(admin, tenant.id, niche.slug).catch(() => {})

  await registrarEvento(await createClient(), {
    leadId,
    evento: 'demo_criada',
    detalhe: `Demo criada (${niche.label})`,
  })

  return {
    link: `https://webstudio-red-eight.vercel.app/demo/entrar?token=${tenant.demo_token}`,
    nicho: niche.label,
  }
}
