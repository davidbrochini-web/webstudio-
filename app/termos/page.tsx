import type { Metadata } from 'next'
import Link from 'next/link'
import PaginaLegal from '@/components/layout/PaginaLegal'

export const metadata: Metadata = {
  title: 'Termos de Serviço',
  description: 'Condições de uso do site omnidesign.com.br e do Omnidesign Painel.',
  alternates: { canonical: '/termos' },
}

export default function Termos() {
  return (
    <PaginaLegal titulo="Termos de Serviço" atualizadoEm="30 de setembro de 2026">
      <p>
        Estes termos regulam o uso do site <strong>omnidesign.com.br</strong> e do <strong>Omnidesign Painel</strong>{' '}
        (&ldquo;Painel&rdquo;), oferecidos pela <strong>Omnidesign</strong>. Ao usar o site ou acessar o Painel, você
        concorda com as condições abaixo.
      </p>

      <h2>1. O que oferecemos</h2>
      <p>
        A Omnidesign cria e hospeda sites e sistemas para pequenos e médios negócios. O Painel é a área logada em que o
        cliente edita o conteúdo do site, acompanha contatos, agenda e resultados, e visualiza relatórios de marketing,
        incluindo dados de Google Ads e Google Analytics quando autorizados.
      </p>

      <h2>2. Conta e acesso</h2>
      <ul>
        <li>O acesso ao Painel é concedido pela Omnidesign a pessoas indicadas pelo cliente.</li>
        <li>Você é responsável por manter sua senha em sigilo e por tudo que ocorrer na sua conta.</li>
        <li>Avise-nos imediatamente se suspeitar de uso indevido do seu acesso.</li>
      </ul>

      <h2>3. Uso adequado</h2>
      <p>É proibido usar o site ou o Painel para:</p>
      <ul>
        <li>violar leis ou direitos de terceiros;</li>
        <li>tentar acessar dados de outros clientes ou contornar controles de segurança;</li>
        <li>enviar conteúdo ilícito, ofensivo ou malicioso;</li>
        <li>sobrecarregar ou interferir no funcionamento do serviço.</li>
      </ul>

      <h2>4. Integrações com o Google</h2>
      <p>
        A conexão com Google Ads e Google Analytics só é feita com a autorização do cliente e pode ser revogada por ele
        a qualquer momento (ver a{' '}
        <Link href="/privacidade">Política de Privacidade</Link>). O uso dessas contas continua sujeito aos termos do
        próprio Google. Ações sobre campanhas (ativar, pausar, ajustar) são executadas a pedido do cliente; o
        investimento em anúncios é cobrado diretamente pelo Google na conta do cliente.
      </p>

      <h2>5. Conteúdo do cliente</h2>
      <p>
        Textos, imagens e dados inseridos pelo cliente continuam sendo dele. O cliente declara ter direito de usá-los e
        nos autoriza a hospedá-los e exibi-los para prestar o serviço.
      </p>

      <h2>6. Propriedade intelectual</h2>
      <p>
        A plataforma, o código, os modelos de site e a marca Omnidesign pertencem à Omnidesign. O contrato firmado com
        cada cliente define o que é licenciado a ele.
      </p>

      <h2>7. Disponibilidade e limitação de responsabilidade</h2>
      <p>
        Trabalhamos para manter o serviço disponível, mas não garantimos funcionamento ininterrupto: manutenções,
        falhas de terceiros (hospedagem, Google, provedores de e-mail) e casos de força maior podem causar
        indisponibilidade. Os relatórios exibem dados fornecidos pelo Google, que podem ter atraso de processamento. Na
        extensão permitida pela lei, a Omnidesign não responde por lucros cessantes ou danos indiretos decorrentes do uso
        ou da impossibilidade de uso do serviço.
      </p>

      <h2>8. Suspensão e encerramento</h2>
      <p>
        Podemos suspender contas que descumpram estes termos. O cliente pode encerrar o serviço conforme o contrato; ao
        final, removemos as credenciais de integrações e tratamos os dados conforme a{' '}
        <Link href="/privacidade">Política de Privacidade</Link>.
      </p>

      <h2>9. Alterações</h2>
      <p>
        Podemos atualizar estes termos; a data no topo indica a versão vigente. Continuar usando o serviço após a
        atualização significa concordar com a nova versão.
      </p>

      <h2>10. Lei aplicável e contato</h2>
      <p>
        Estes termos seguem a legislação brasileira. Dúvidas:{' '}
        <a href="mailto:contato@omnidesign.com.br">contato@omnidesign.com.br</a>.
      </p>
    </PaginaLegal>
  )
}
