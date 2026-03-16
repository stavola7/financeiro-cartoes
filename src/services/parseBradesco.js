import { categorizar } from '../utils/categorizar'

export function parseBradesco(binary) {
  const strings = []
  let cur = ''
  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    if (c >= 32 && c <= 126) cur += binary[i]
    else { if (cur.length > 3) strings.push(cur.trim()); cur = '' }
  }
  if (cur.length > 3) strings.push(cur.trim())

  const dateReg = /^\d{2}\/\d{2}$/
  const valReg  = /^-?\d{1,4},\d{2}$/
  const SKIP    = new Set(['Data','Hist','rico','Valor (US$)','Valor(R$)','SALDO ANTERIOR','PAGTO. POR DEB EM C/C'])
  const IGNORE_DESC = ['Total','Resumo','Cotacao','Taxa','Saldo','Sheet','Content','theme','rels']

  const ano = new Date().getFullYear()
  const results = []

  // Encontra onde os dados começam (primeira data DD/MM)
  const startIdx = strings.findIndex(s => dateReg.test(s))
  if (startIdx === -1) return results

  // Divide em blocos por data DD/MM
  const blocks = []
  let block = null
  for (let i = startIdx; i < strings.length; i++) {
    const s = strings[i]
    // Para quando sair do range de dados reais
    if (/^\[Content_Types\]/.test(s) || /^theme\//.test(s) || /^_rels/.test(s)) break
    if (dateReg.test(s)) {
      block = { date: s, items: [] }
      blocks.push(block)
    } else if (block) {
      block.items.push(s)
    }
  }

  // Itens antes da primeira data (ex: BUS SERVICOS no 0549)
  const preItems = []
  for (let i = startIdx - 1; i >= 0; i--) {
    const s = strings[i]
    if (/^(Data|Hist|rico|Valor|Sheet|#,##)/.test(s)) break
    preItems.unshift(s)
  }
  if (preItems.length > 0 && blocks.length > 0) {
    blocks[0].items = [...preItems, ...blocks[0].items]
  }

  for (const blk of blocks) {
    const [d, m] = blk.date.split('/')
    const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

    const items = blk.items.filter(s =>
      !SKIP.has(s) &&
      !IGNORE_DESC.some(w => s.startsWith(w)) &&
      !/^[#_\[{]/.test(s)
    )

    // Pilha de descrições: valor pega a última descrição pendente
    const pendingDescs = []

    for (const s of items) {
      if (valReg.test(s)) {
        if (pendingDescs.length > 0) {
          const desc = pendingDescs.pop()
          const val  = parseFloat(s.replace(',', '.'))
          const isEstorno = val < 0
          results.push({
            id: `brad_${results.length}`,
            banco: 'bradesco',
            data: dataISO,
            descricao: desc,
            categoria: categorizar(desc),
            tipo: isEstorno ? 'Estorno' : 'Compra',
            valor: isEstorno ? Math.abs(val) : -val,
            titular: '',
          })
        }
        // valor sem desc = IOF/taxa = ignora
      } else if (s.length > 3 && !/^\d+$/.test(s)) {
        pendingDescs.push(s)
      }
    }
  }

  return results
}