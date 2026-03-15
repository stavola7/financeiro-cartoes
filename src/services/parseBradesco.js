import { categorizar } from '../utils/categorizar'

export function parseBradesco(binary) {
  const strings = []
  let cur = ''
  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    if (c >= 32 && c <= 126) cur += binary[i]
    else { if (cur.length > 3) strings.push(binary.slice ? cur.trim() : cur.trim()); cur = '' }
  }
  if (cur.length > 3) strings.push(cur.trim())

  const dateReg = /^\d{2}\/\d{2}$/
  const results = []
  let holder = ''
  const ano = new Date().getFullYear()

  let i = 0
  while (i < strings.length) {
    const s = strings[i]

    const hm = s.match(/ALEXANDRE M STAVOLA - (\d{4})/)
    if (hm) { holder = hm[1]; i++; continue }

    if (dateReg.test(s) && holder) {
      const dateStr = s
      const items = []
      let j = i + 1
      while (j < strings.length) {
        const n = strings[j]
        if (dateReg.test(n) || /Total para/.test(n)) break
        items.push(n)
        j++
      }

      let currentDesc = ''
      for (let k = 0; k < items.length; k++) {
        const n = items[k]
        if (/^-?\d{1,3},\d{2}$/.test(n)) {
          const val = parseFloat(n.replace(',', '.'))
          if (currentDesc && val > 0) {
            const [d, m] = dateStr.split('/')
            results.push({
              id: 'brad_' + results.length,
              banco: 'bradesco',
              data: `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`,
              descricao: currentDesc,
              categoria: categorizar(currentDesc),
              tipo: 'Compra',
              valor: -val,
              titular: 'Cartao ' + holder,
            })
            currentDesc = ''
          }
        } else if (
          n.length > 2 &&
          !/^Total/.test(n) &&
          !/^Valor/.test(n) &&
          !/^Data/.test(n) &&
          !/^PAGTO/.test(n) &&
          !/^SALDO/.test(n) &&
          !/^\d+$/.test(n) &&
          n !== 'lar utilizada:'
        ) {
          currentDesc = n
        }
      }
      i = j
      continue
    }
    i++
  }

  return results
}