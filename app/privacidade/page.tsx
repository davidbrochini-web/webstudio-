import type { Metadata } from 'next'
import PaginaLegal from '@/components/layout/PaginaLegal'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description:
    'Como a Omnidesign coleta, usa e protege dados pessoais no site, no Omnidesign Painel e nas integrações com Google Ads e Google Analytics (LGPD).',
  alternates: { canonical: '/privacidade' },
}

export default function Privacidade() {
  return (
    <PaginaLegal titulo="Política de Privacidade" atualizadoEm="30 de setembro de 2026">
      <p>
        Esta política explica como a <strong>Omnidesign</strong> (&ldquo;nós&rdquo;) trata dados pessoais no site{' '}
        <strong>omnidesign.com.br</strong> e no <strong>Omnidesign Painel</strong>, a área logada onde nossos clientes
        acompanham seus sites, contatos e resultados de marketing. Seguimos a Lei Geral de Proteção de Dados (LGPD, Lei
        13.709/2018).
      </p>

      <h2>1. Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Formulários de contato:</strong> nome, e-mail, telefone e a mensagem que você escrever.
        </li>
        <li>
          <strong>Conta no Painel:</strong> e-mail e senha (a senha é armazenada de forma protegida pelo nosso provedor de
          autenticação, nunca em texto puro) e o vínculo da conta com a empresa do cliente.
        </li>
        <li>
          <strong>Dados de navegação:</strong> páginas visitadas, tipo de dispositivo e origem da visita, coletados pelo
          Google Analytics por meio de cookies.
        </li>
        <li>
          <strong>Dados de integrações Google</strong>, quando o cliente nos autoriza (ver seção 3).
        </li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Responder contatos e propostas comerciais.</li>
        <li>Permitir o login e o funcionamento do Painel.</li>
        <li>Entender como o site é usado e melhorá-lo.</li>
        <li>Prestar o serviço contratado pelo cliente (site, sistemas e gestão de anúncios).</li>
        <li>Cumprir obrigações legais.</li>
      </ul>
      <p>Não vendemos dados pessoais.</p>

      <h2>3. Integrações com o Google (Google Ads e Google Analytics)</h2>
      <p>
        O Omnidesign Painel se conecta às APIs do Google <strong>somente quando o cliente autoriza</strong>, por meio da
        tela de consentimento do Google. Os acessos solicitados são:
      </p>
      <ul>
        <li>
          <strong>Google Ads</strong> (<code>auth/adwords</code>): ler dados das contas de anúncios do cliente, como
          campanhas, orçamentos, impressões, cliques, custos, conversões e termos de busca; e, quando o cliente nos pede,
          ativar, pausar ou ajustar campanhas.
        </li>
        <li>
          <strong>Google Analytics</strong> (<code>auth/analytics.readonly</code>): ler, <em>somente leitura</em>,
          relatórios do site do cliente, como número de visitantes, origem do tráfego e páginas mais vistas.
        </li>
      </ul>
      <p>
        <strong>Como usamos esses dados:</strong> exclusivamente para exibir relatórios ao próprio cliente no Painel e
        para gerenciar as campanhas dele. Não usamos esses dados para publicidade, não os vendemos, não os transferimos a
        terceiros (exceto quando necessário para prestar o serviço, cumprir a lei ou com autorização expressa) e não os
        usamos para treinar modelos de inteligência artificial. Pessoas da nossa equipe só acessam esses dados quando
        necessário para suporte, segurança ou para cumprir o serviço contratado.
      </p>
      <p>
        <strong>Armazenamento:</strong> guardamos a credencial de acesso (token) em banco de dados com acesso restrito,
        utilizado apenas pelo nosso servidor. Os números de relatório são consultados sob demanda e mantidos em cache
        temporário; não formamos uma base própria de dados do Google.
      </p>
      <p>
        <strong>Como revogar:</strong> o cliente pode remover o acesso a qualquer momento em{' '}
        <a href="https://myaccount.google.com/permissions" rel="noopener noreferrer" target="_blank">
          myaccount.google.com/permissions
        </a>{' '}
        ou pedindo a nós. Ao encerrar o contrato ou receber o pedido, excluímos a credencial.
      </p>
      <p>
        O uso e a transferência, para qualquer outro aplicativo, das informações recebidas das APIs do Google pelo
        Omnidesign Painel obedecerão à{' '}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Política de Dados do Usuário dos Serviços de API do Google
        </a>
        , incluindo os requisitos de Uso Limitado.
      </p>
      <p>
        <em>
          Omnidesign Painel&apos;s use and transfer to any other app of information received from Google APIs will
          adhere to the Google API Services User Data Policy, including the Limited Use requirements.
        </em>
      </p>

      <h2>4. Com quem compartilhamos</h2>
      <p>Usamos prestadores que tratam dados em nosso nome, apenas para operar o serviço:</p>
      <ul>
        <li>Supabase (banco de dados e autenticação);</li>
        <li>Vercel (hospedagem);</li>
        <li>Resend (envio de e-mails do sistema);</li>
        <li>Google (Analytics, Ads e as APIs descritas acima).</li>
      </ul>
      <p>
        Alguns desses prestadores podem processar dados fora do Brasil, com salvaguardas previstas na LGPD. Também
        podemos divulgar dados quando exigido por lei ou ordem de autoridade.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Usamos cookies do Google Analytics para medir visitas e cookies de sessão para manter você logado no Painel. Você
        pode bloquear ou apagar cookies nas configurações do navegador; o site continua funcionando, mas o login depende
        de cookies de sessão.
      </p>

      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Mantemos os dados pelo tempo necessário para a finalidade que os originou e para cumprir obrigações legais.
        Contatos comerciais ficam enquanto houver interesse na relação; dados da conta do cliente, enquanto o contrato
        estiver ativo e pelos prazos legais depois dele.
      </p>

      <h2>7. Seus direitos</h2>
      <p>
        Nos termos da LGPD, você pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade,
        informação sobre compartilhamentos, exclusão de dados tratados com base em consentimento e revogação do
        consentimento. Para exercer qualquer direito, escreva para o e-mail abaixo.
      </p>

      <h2>8. Sites de clientes</h2>
      <p>
        A Omnidesign também hospeda sites de clientes (por exemplo, o de uma clínica). Nesses sites, o cliente é o
        responsável pelos dados de seus visitantes e pacientes, e nós atuamos como operadores, tratando os dados
        conforme as instruções dele. Dúvidas sobre esses dados devem ser dirigidas primeiro ao próprio cliente.
      </p>

      <h2>9. Segurança</h2>
      <p>
        Adotamos controle de acesso por conta, isolamento dos dados de cada cliente, conexão criptografada (HTTPS) e
        acesso restrito às credenciais. Nenhum sistema é totalmente imune a incidentes; se ocorrer um que afete você,
        comunicaremos conforme a LGPD.
      </p>

      <h2>10. Alterações e contato</h2>
      <p>
        Podemos atualizar esta política; a data no topo da página indica a versão vigente. Dúvidas, pedidos de titulares
        ou revogação de acessos:{' '}
        <a href="mailto:contato@omnidesign.com.br">contato@omnidesign.com.br</a>.
      </p>
    </PaginaLegal>
  )
}
