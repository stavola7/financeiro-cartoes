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
  const amountReg = /^\d{1,3}(,\d{2})?$/
  const results = []
  let holder = ''
  let ano = new Date().getFullYear()

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i]

    const hm = s.match(/ALEXANDRE M STAVOLA - (\d{4})/)
    if (hm) { holder = hm[1]; continue }

    if (dateReg.test(s) && holder) {
      let desc = ''
      let val = 0

      for (let j = i + 1; j < Math.min(i + 10, strings.length); j++) {
        const n = strings[j]
        if (dateReg.test(n)) break
        if (/^\d{1,3},\d{2}$/.test(n)) {
          val = parseFloat(n.replace(',', '.')) || 0
        } else if (
          n.length > 2 &&
          !n.match(/^Total/) &&
          !n.match(/^Valor/) &&
          !n.match(/^Data/) &&
          n !== 'SALDO ANTERIOR' &&
          !n.match(/^\d+$/)
        ) {
          if (!desc) desc = n
        }
      }

      if (desc && val > 0) {
        const [d, m] = s.split('/')
        const dataISO = `${ano}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
        results.push({
          id: 'brad_' + results.length,
          banco: 'bradesco',
          data: dataISO,
          descricao: desc,
          categoria: categorizar(desc),
          tipo: 'Compra',
          valor: -val,
          titular: 'Cartao ' + holder,
        })
      }
    }
  }

  return results
}
