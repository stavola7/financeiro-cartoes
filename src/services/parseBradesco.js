import { categorizar } from '../utils/categorizar'

export function parseBradesco(binary) {
  // Extrai strings legíveis do binário XLS
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
  const SKIP = new Set(['Data','Hist','rico','Valor (US$)','Valor(R$)','SALDO ANTERIOR','PAGTO. POR DEB EM C/C'])

  const results = []
  const ano = new Date().getFullYear()

  // Encontra seções de cada titular: do nome até "Total para ALEXANDRE"
  const sections = []
  let cur_section = null
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]
    const hm = s.match(/([A-Z ]+STAVOLA[A-Z ]*) - (\d{4})/)
    if (hm) {
      if (cur_section) cur_section.end = i
      cur_section = { holder: hm[2], start: i + 1, end: strings.length }
      sections.push(cur_section)
    }
    if (/^Total para /.test(s) && cur_section && !cur_section.closed) {
      cur_section.end = i
      cur_section.closed = true
    }
  }

  for (const section of sections) {
    const items = strings.slice(section.start, section.end).filter(s => !SKIP.has(s))

    // Itens antes da primeira data pertencem à primeira data da seção
    let firstDateIdx = items.findIndex(s => dateReg.test(s))
    const preItems = firstDateIdx > 0 ? items.slice(0, firstDateIdx) : []

    // Divide em blocos por data
    const blocks = []
    let block = null
    for (const s of items) {
      if (dateReg.test(s)) {
        block = { date: s, items: [] }
        blocks.push(block)
      } else if (block) {
        block.items.push(s)
      }
    }

    // Adiciona itens pré-data ao primeiro bloco
    if (blocks.length > 0 && preItems.length > 0) {
      blocks[0].items = [...preItems, ...blocks[0].items]
    }

    for (const blk of blocks) {
      const [d, m] = blk.date.split('/')
      const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

      // Percorre itens do bloco pareando desc → valor
      let pendingDesc = null
      let pendingVals = []

      const flush = () => {
        if (!pendingDesc || pendingVals.length === 0) { pendingDesc = null; pendingVals = []; return }
        const pos = pendingVals.filter(v => v > 0)
        if (pos.length === 0) { pendingDesc = null; pendingVals = []; return }
        // Pega o primeiro valor positivo como valor principal da transação
        const val = pos[0]
        results.push({
          id: `brad_${results.length}`,
          banco: 'bradesco',
          data: dataISO,
          descricao: pendingDesc,
          categoria: categorizar(pendingDesc),
          tipo: 'Compra',
          valor: -val,
          titular: `Cartao ${section.holder}`,
        })
        pendingDesc = null
        pendingVals = []
      }

      for (const s of blk.items) {
        if (valReg.test(s)) {
          const v = parseFloat(s.replace(',', '.'))
          if (pendingDesc) pendingVals.push(v)
        } else if (s.length > 3 && !/^\d+$/.test(s)) {
          flush()
          pendingDesc = s
        }
      }
      flush()
    }
  }

  return results
}
