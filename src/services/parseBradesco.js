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

  const ano     = new Date().getFullYear()
  const results = []

  // Encontra onde os dados começam (primeira data DD/MM)
  const startIdx = strings.findIndex(s => dateReg.test(s))
  if (startIdx === -1) return results

  // Divide em blocos por data, para em [Content_Types]
  const blocks = []
  let block = null
  for (let i = startIdx; i < strings.length; i++) {
    const s = strings[i]
    if (s.startsWith('[Content') || s.startsWith('theme/') || s.startsWith('_rels')) break
    if (dateReg.test(s)) {
      block = { date: s, items: [] }
      blocks.push(block)
    } else if (block) {
      block.items.push(s)
    }
  }

  // Itens antes da primeira data vão pro primeiro bloco
  const preItems = []
  for (let i = startIdx - 1; i >= 0; i--) {
    const s = strings[i]
    if (/^(Data|Hist|rico|Valor|Sheet|#,##|_-)/.test(s)) break
    if (s.length > 3) preItems.unshift(s)
  }
  if (preItems.length > 0 && blocks.length > 0) {
    blocks[0].items = [...preItems, ...blocks[0].items]
  }

  for (const blk of blocks) {
    const [d, m] = blk.date.split('/')
    const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

    const items = blk.items.filter(s => !SKIP.has(s))

    // Percorre em sequência: desc → val = uma transação
    // val sem desc anterior = IOF/taxa = ignora
    // desc sem val = sobrescreve (pega a mais recente)
    let pendingDesc = null
    for (const s of items) {
      if (valReg.test(s)) {
        if (pendingDesc !== null) {
          const val = parseFloat(s.replace(',', '.'))
          const isEstorno = val < 0
          results.push({
            id: `brad_${results.length}`,
            banco: 'bradesco',
            data: dataISO,
            descricao: pendingDesc,
            categoria: categorizar(pendingDesc),
            tipo: isEstorno ? 'Estorno' : 'Compra',
            valor: isEstorno ? Math.abs(val) : -val,
            titular: '',
          })
          pendingDesc = null
        }
        // val sem desc = ignora
      } else if (s.length > 3 && !/^\d+$/.test(s)) {
        pendingDesc = s
      }
    }
  }

  return results
}