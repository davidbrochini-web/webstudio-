import type { SupabaseClient } from '@supabase/supabase-js'

interface CadastroSeed {
  clientes: { nome: string; tipo_pessoa: 'fisica' | 'juridica'; telefone: string }[]
  funcionarios: { nome: string; cargo: string }[]
  produtos_servicos: { tipo: 'produto' | 'servico'; nome: string; preco: number; unidade: string }[]
  fornecedores: { nome: string; tipo_pessoa: 'fisica' | 'juridica'; telefone: string }[]
}

const SEEDS: Record<string, CadastroSeed> = {
  clinico: {
    clientes: [
      { nome: 'Marina Alves', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Carlos Eduardo Souza', tipo_pessoa: 'fisica', telefone: '5511976543210' },
      { nome: 'Beatriz Lima', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Dra. Fernanda Costa', cargo: 'Dentista' },
      { nome: 'Juliana Ramos', cargo: 'Recepcionista' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Limpeza dental', preco: 150, unidade: 'sessão' },
      { tipo: 'servico', nome: 'Clareamento', preco: 800, unidade: 'sessão' },
      { tipo: 'produto', nome: 'Kit escovação', preco: 45, unidade: 'un' },
    ],
    fornecedores: [
      { nome: 'Dental Supply Materiais Odontológicos', tipo_pessoa: 'juridica', telefone: '5511930001111' },
      { nome: 'Laboratório Sorriso Prótese', tipo_pessoa: 'juridica', telefone: '5511930002222' },
    ],
  },
  editorial: {
    clientes: [
      { nome: 'Roberto Mendes', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Construtora Horizonte Ltda', tipo_pessoa: 'juridica', telefone: '5511930003333' },
      { nome: 'Ana Paula Ferreira', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Dr. Ricardo Nunes', cargo: 'Advogado sócio' },
      { nome: 'Patrícia Gomes', cargo: 'Assistente jurídica' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Consulta inicial', preco: 300, unidade: 'hora' },
      { tipo: 'servico', nome: 'Elaboração de contrato', preco: 900, unidade: 'un' },
    ],
    fornecedores: [
      { nome: 'Cartório 5º Ofício de Notas', tipo_pessoa: 'juridica', telefone: '5511930004444' },
    ],
  },
  portfolio: {
    clientes: [
      { nome: 'Camila Rocha', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Buffet Doce Momento', tipo_pessoa: 'juridica', telefone: '5511930005555' },
      { nome: 'Lucas Tavares', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Rafael Duarte', cargo: 'Fotógrafo principal' },
      { nome: 'Bianca Santos', cargo: 'Editora de imagem' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Ensaio individual', preco: 450, unidade: 'sessão' },
      { tipo: 'servico', nome: 'Cobertura de casamento', preco: 3500, unidade: 'evento' },
      { tipo: 'produto', nome: 'Álbum impresso 30x30', preco: 600, unidade: 'un' },
    ],
    fornecedores: [
      { nome: 'Foto Lab Revelações', tipo_pessoa: 'juridica', telefone: '5511930006666' },
    ],
  },
  urbano: {
    clientes: [
      { nome: 'Pedro Henrique', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Gabriel Costa', tipo_pessoa: 'fisica', telefone: '5511976543210' },
      { nome: 'Vinícius Almeida', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Diego Barbosa', cargo: 'Barbeiro' },
      { nome: 'Thiago Martins', cargo: 'Barbeiro' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Corte + barba', preco: 70, unidade: 'sessão' },
      { tipo: 'servico', nome: 'Corte degradê', preco: 45, unidade: 'sessão' },
      { tipo: 'produto', nome: 'Pomada modeladora', preco: 35, unidade: 'un' },
    ],
    fornecedores: [
      { nome: 'Barber Supply Distribuidora', tipo_pessoa: 'juridica', telefone: '5511930007777' },
    ],
  },
  performance: {
    clientes: [
      { nome: 'Larissa Cardoso', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Fábio Rodrigues', tipo_pessoa: 'fisica', telefone: '5511976543210' },
      { nome: 'Mariana Teixeira', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Bruno Cavalcanti', cargo: 'Personal trainer' },
      { nome: 'Renata Vieira', cargo: 'Instrutora de musculação' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Plano mensal', preco: 180, unidade: 'mês' },
      { tipo: 'servico', nome: 'Personal 1:1', preco: 120, unidade: 'sessão' },
      { tipo: 'produto', nome: 'Whey protein 900g', preco: 140, unidade: 'un' },
    ],
    fornecedores: [
      { nome: 'Fit Equipamentos e Suplementos', tipo_pessoa: 'juridica', telefone: '5511930008888' },
    ],
  },
  zen: {
    clientes: [
      { nome: 'Isabela Nogueira', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Eduardo Farias', tipo_pessoa: 'fisica', telefone: '5511976543210' },
      { nome: 'Sofia Martins', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Clara Menezes', cargo: 'Terapeuta' },
      { nome: 'Helena Prado', cargo: 'Recepcionista' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Massagem relaxante', preco: 180, unidade: 'sessão' },
      { tipo: 'servico', nome: 'Drenagem linfática', preco: 200, unidade: 'sessão' },
    ],
    fornecedores: [
      { nome: 'Aromas & Óleos Essenciais', tipo_pessoa: 'juridica', telefone: '5511930009999' },
    ],
  },
  acolhedor: {
    clientes: [
      { nome: 'Responsável: Marcos Silva', tipo_pessoa: 'fisica', telefone: '5511987654321' },
      { nome: 'Responsável: Cristina Alves', tipo_pessoa: 'fisica', telefone: '5511976543210' },
      { nome: 'Responsável: André Barros', tipo_pessoa: 'fisica', telefone: '5511965432109' },
    ],
    funcionarios: [
      { nome: 'Profª. Renata Souza', cargo: 'Coordenadora pedagógica' },
      { nome: 'Marcelo Andrade', cargo: 'Professor' },
    ],
    produtos_servicos: [
      { tipo: 'servico', nome: 'Matrícula', preco: 250, unidade: 'un' },
      { tipo: 'servico', nome: 'Mensalidade', preco: 420, unidade: 'mês' },
    ],
    fornecedores: [
      { nome: 'Papelaria Educativa Distribuidora', tipo_pessoa: 'juridica', telefone: '5511930001010' },
    ],
  },
}

/**
 * Semeia dados de exemplo nos 4 sub-módulos de Cadastros — sem isso,
 * o módulo mais forte da demo (segundo o próprio David) aparece
 * vazio na primeira visita, o que reduz o impacto.
 */
export async function seedCadastrosDemo(supabase: SupabaseClient, tenantId: string, pagelayout: string) {
  const seed = SEEDS[pagelayout] ?? SEEDS.clinico

  await Promise.all([
    supabase.from('clientes').insert(seed.clientes.map(c => ({ tenant_id: tenantId, ...c, status: 'ativo' }))),
    supabase.from('funcionarios').insert(seed.funcionarios.map(f => ({ tenant_id: tenantId, ...f, status: 'ativo' }))),
    supabase.from('produtos_servicos').insert(seed.produtos_servicos.map(p => ({ tenant_id: tenantId, ...p, status: 'ativo' }))),
    supabase.from('fornecedores').insert(seed.fornecedores.map(f => ({ tenant_id: tenantId, ...f, status: 'ativo' }))),
  ])
}
