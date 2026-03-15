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
  const valReg = /^-?\d{1,4},\d{2}$/
  const skipWords = ['SALDO ANTERIOR','PAGTO. POR DEB EM C/C','Total para','Total da','Data','Hist','rico','Valor','BUS SERVICOS']

  const results = []
  let holder = ''
  const ano = new Date().getFullYear()

  // Find start/end of each holder section
  let sections = []
  let currentSection = null

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]
    const hm = s.match(/([A-Z ]+STAVOLA[A-Z ]*) - (\d{4})/)
    if (hm) {
      if (currentSection) currentSection.end = i
      currentSection = { holder: hm[2], start: i + 1, end: strings.length }
      sections.push(currentSection)
    }
    if (/Total da fatura/.test(s) && currentSection) {
      currentSection.end = i
    }
  }

  for (const section of sections) {
    const items = strings.slice(section.start, section.end)
    let currentDate = ''
    let pendingDescs = []

    for (let i = 0; i < items.length; i++) {
      const s = items[i]

      // Skip header/summary lines
      if (skipWords.some(w => s.startsWith(w))) continue
      if (/ALEXANDRE M STAVOLA/.test(s)) continue

      if (dateReg.test(s)) {
        currentDate = s
        pendingDescs = []
        continue
      }

      if (!currentDate) continue

      const isDesc = s.length > 3 && !valReg.test(s) && !/^\d+$/.test(s)
      const isVal = valReg.test(s)

      if (isDesc) {
        pendingDescs.push(s)
      } else if (isVal) {
        const val = parseFloat(s.replace(',', '.'))
        if (val > 0 && pendingDescs.length > 0) {
          // Use the last pending description
          const desc = pendingDescs[pendingDescs.length - 1]
          pendingDescs = []
          const [d, m] = currentDate.split('/')
          results.push({
            id: 'brad_' + results.length,
            banco: 'bradesco',
            data: `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`,
            descricao: desc,
            categoria: categorizar(desc),
            tipo: 'Compra',
            valor: -val,
            titular: 'Cartao ' + section.holder,
          })
        } else if (val > 0 && pendingDescs.length === 0) {
          // value with no desc = fee, skip
        }
      }
    }
  }

  return results
}
