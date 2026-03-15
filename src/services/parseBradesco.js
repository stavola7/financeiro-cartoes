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
  const SKIP = new Set([
    'Data','Hist','rico','Valor (US$)','Valor(R$)',
    'SALDO ANTERIOR','PAGTO. POR DEB EM C/C'
  ])

  const results = []
  const ano = new Date().getFullYear()

  // Encontra seções de cada titular até "Total para"
  const sections = []
  let curSection = null
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]
    const hm = s.match(/([A-Z ]+STAVOLA[A-Z ]*) - (\d{4})/)
    if (hm) {
      if (curSection && !curSection.closed) curSection.end = i
      curSection = { holder: hm[2], start: i + 1, end: strings.length, closed: false }
      sections.push(curSection)
    }
    if (/^Total para /.test(s) && curSection && !curSection.closed) {
      curSection.end = i
      curSection.closed = true
    }
  }

  for (const section of sections) {
    const items = strings.slice(section.start, section.end)

    // Varre item por item procurando datas
    // REGRA: só processa linhas que têm data DD/MM
    // Após uma data, o próximo texto não-numérico é a descrição
    // O próximo número após a descrição é o valor
    let i = 0
    while (i < items.length) {
      const s = items[i]

      // Encontrou uma data válida DD/MM
      if (dateReg.test(s) && !SKIP.has(s)) {
        const [d, m] = s.split('/')
        const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

        // Coleta desc e valor nos próximos itens até a próxima data
        let desc = null
        let val = null
        let j = i + 1

        while (j < items.length) {
          const n = items[j]

          // Próxima data = para de coletar para essa data
          if (dateReg.test(n)) break
          // Linha de total = para tudo
          if (/^Total para/.test(n)) break

          if (SKIP.has(n)) { j++; continue }

          // É um valor numérico
          if (valReg.test(n)) {
            if (desc && val === null) {
              // Primeiro valor após descrição = valor da transação
              val = parseFloat(n.replace(',', '.'))
              // Salva e reseta para pegar próximas descrições do mesmo dia
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
              val = null
            }
            // Valor sem descrição antes = IOF/taxa = ignora
          } else if (n.length > 3 && !/^\d+$/.test(n)) {
            // É uma descrição
            desc = n
            val = null
          }

          j++
        }

        i = j
        continue
      }

      i++
    }
  }

  return results
}