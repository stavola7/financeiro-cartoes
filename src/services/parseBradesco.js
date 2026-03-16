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
  const STOP    = ['Total para ALEXANDRE', 'Total da fatura']
  const IGNORE  = ['Total para','Resumo','Cotacao','Taxa','Saldo Anterior']

  const ano     = new Date().getFullYear()
  const results = []

  // Encontra seções de cada titular até linha de total
  const sections = []
  let curSection = null
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]
    const hm = s.match(/ALEXANDRE M STAVOLA - (\d{4})/)
    if (hm) {
      if (curSection && curSection.end === strings.length) curSection.end = i
      curSection = { holder: hm[1], start: i + 1, end: strings.length }
      sections.push(curSection)
    }
    if (STOP.some(sw => s.startsWith(sw)) && curSection && curSection.end === strings.length) {
      curSection.end = i
    }
  }

  for (const section of sections) {
    const raw = strings.slice(section.start, section.end)

    // Divide em blocos por data DD/MM
    const blocks = []
    let block = null
    for (const s of raw) {
      if (dateReg.test(s)) {
        block = { date: s, items: [] }
        blocks.push(block)
      } else if (block) {
        block.items.push(s)
      }
    }

    // Itens antes da primeira data (ex: BUS SERVICOS no 0549) vão pro primeiro bloco
    const preItems = []
    for (const s of raw) {
      if (dateReg.test(s)) break
      preItems.push(s)
    }
    if (preItems.length > 0 && blocks.length > 0) {
      blocks[0].items = [...preItems, ...blocks[0].items]
    }

    for (const blk of blocks) {
      const [d, m] = blk.date.split('/')
      const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

      // Filtra itens inválidos
      const items = blk.items.filter(s =>
        !SKIP.has(s) && !IGNORE.some(w => s.startsWith(w))
      )

      // Lógica: acumula descrições numa pilha
      // Quando encontra um valor, pega a ÚLTIMA descrição da pilha
      // Valor sem descrição = IOF/taxa = ignora
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
              titular: `Cartao ${section.holder}`,
            })
          }
          // sem desc = ignora
        } else if (s.length > 3 && !/^\d+$/.test(s)) {
          pendingDescs.push(s)
        }
      }
      // descs sem valor = sem preço disponível = ignora
    }
  }

  return results
}