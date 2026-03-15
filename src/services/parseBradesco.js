import { categorizar } from '../utils/categorizar'

export function parseBradesco(binary) {
  const strings = []
  let cur = ''

  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    if (c >= 32 && c <= 126) {
      cur += binary[i]
    } else {
      if (cur.length > 3) strings.push(cur)
      cur = ''
    }
  }
  if (cur.length > 3) strings.push(cur)

  const dateReg = /^\d{2}\/\d{2}\/\d{4}$/
  const results = []
  let holder = ''

  for (let i = 0; i < strings.length; i++) {
    const s = strings[i].trim()

    const hm = s.match(/([A-Z\s]+) - (\d{4})$/)
    if (hm) {
      holder = hm[2]
      continue
    }

    if (dateReg.test(s) && holder) {
      let desc = ''
      let val = 0

      for (let j = i + 1; j < Math.min(i + 8, strings.length); j++) {
        const n = strings[j].trim()
        if (dateReg.test(n)) break
        if (/^-?\d{1,3}(\.\d{3})*(,\d{2})?$/.test(n) || /^-?\d+,\d{2}$/.test(n)) {
          val = parseFloat(n.replace(/\./g, '').replace(',', '.')) || 0
        } else if (n.length > 2 && !n.match(/^Total/) && n !== 'SALDO ANTERIOR' && !n.match(/^\d+$/)) {
          if (!desc) desc = n
        }
      }

      if (desc && !desc.match(/^Total/) && desc !== 'SALDO ANTERIOR') {
        const [d, m, y] = s.split('/')
        results.push({
          id: 'brad_' + results.length,
          banco: 'bradesco',
          data: `${y}-${m}-${d}`,
          descricao: desc,
          categoria: categorizar(desc),
          tipo: 'Compra',
          valor: -Math.abs(val),
          titular: 'Cartao ' + holder,
        })
      }
    }
  }

  return results
}