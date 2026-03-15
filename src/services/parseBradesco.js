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
  const SKIP = new Set(['Data','Hist','rico','Valor (US$)','Valor(R$)','SALDO ANTERIOR','PAGTO. POR DEB EM C/C'])
  const STOP = ['Total para ALEXANDRE', 'Total da fatura']
  const IGNORE_DESC = ['Total para', 'Resumo', 'Saldo', 'Pagamento', 'Despesas', 'Cotacao', 'Taxa']

  const ano = new Date().getFullYear()
  const results = []

  // Encontra seções de cada titular
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
    const items = strings.slice(section.start, section.end)
    let i = 0

    while (i < items.length) {
      const s = items[i]

      // Só processa se for uma data válida DD/MM
      if (!dateReg.test(s)) { i++; continue }

      const [d, m] = s.split('/')
      const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

      let desc = null
      let j = i + 1

      while (j < items.length) {
        const n = items[j]

        // Para na próxima data
        if (dateReg.test(n)) break
        // Para em linha de total/resumo
        if (STOP.some(sw => n.startsWith(sw))) { i = items.length; break }

        if (SKIP.has(n)) { j++; continue }

        if (valReg.test(n)) {
          // Só registra se tem descrição antes
          if (desc !== null) {
            const val = parseFloat(n.replace(',', '.'))
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
            desc = null
          }
          // Valor sem descrição = IOF/taxa = ignora
        } else if (
          n.length > 3 &&
          !/^\d+$/.test(n) &&
          !IGNORE_DESC.some(w => n.startsWith(w))
        ) {
          desc = n
        }

        j++
      }

      i = j
    }
  }

  return results
}