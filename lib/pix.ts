// Gerador de "Pix Copia e Cola" (BR Code, padrão EMV do Banco
// Central). Não depende de nenhuma API externa — é só montagem de
// string + checksum, o mesmo formato que qualquer app de banco lê
// pra preencher os dados do pagamento.

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0')
  return `${id}${len}${value}`
}

function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

export interface PixParams {
  /** Chave Pix — CPF, CNPJ, e-mail, telefone ou chave aleatória. */
  chave: string
  /** Nome do recebedor, até 25 caracteres (truncado automaticamente). */
  nome: string
  /** Cidade do recebedor, até 15 caracteres (truncado automaticamente). */
  cidade: string
  /** Valor em reais (ex: 1000.5). */
  valor: number
  /** Identificador da transação — "***" (sem txid específico) por padrão. */
  txid?: string
}

/** Monta o payload "Pix Copia e Cola" pronto pra colar em qualquer
 *  banco, ou pra virar QR Code. */
export function gerarPixCopiaECola({ chave, nome, cidade, valor, txid = '***' }: PixParams): string {
  const nomeTrunc = semAcento(nome).slice(0, 25)
  const cidadeTrunc = semAcento(cidade).slice(0, 15)
  const valorStr = valor.toFixed(2)

  const merchantAccountInfo = tlv('00', 'br.gov.bcb.pix') + tlv('01', chave)
  const additionalData = tlv('05', txid)

  let payload =
    tlv('00', '01') +
    tlv('26', merchantAccountInfo) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', valorStr) +
    tlv('58', 'BR') +
    tlv('59', nomeTrunc) +
    tlv('60', cidadeTrunc) +
    tlv('62', additionalData)

  payload += '6304'
  return payload + crc16(payload)
}

/** Dados fixos do recebedor (David) usados em todos os Pix gerados
 *  no painel dos clientes. Só a chave CPF por enquanto — se um dia
 *  virar CNPJ da Omnidesign, troca só aqui. */
export const PIX_RECEBEDOR = {
  chave: '37814612896',
  nome: 'David Brochini',
  cidade: 'Sao Paulo',
}
