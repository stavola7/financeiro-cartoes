export function parseBradesco(binary) {
  const strings = []
  let cur = ''
  for (let i = 0; i < binary.length; i++) {
    const c = binary.charCodeAt(i)
    if (c >= 32 && c <= 126) cur += binary[i]
    else { if (cur.length > 3) strings.push(cur); cur = '' }
  }
  const dateReg = /^\d{2}\/\d{2}\/\d{4}$/
  const results = []
  let holder = ''
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i].trim()
    const hm = s.match(/ALEXANDRE M STAVOLA - (\d{4})/)
    if (hm) { holder = hm[1]; continue }
    if (dateReg.test(s) && holder) {
      let desc = '', val = 0
      for (let j = i+1; j < Math.min(i+8, strings.length); j++) {
        const n = strings[j].trim()
        if (dateReg.test(n)) break
        if (/^-?\d+,\d{2}$/.test(n)) {
          val = parseFloat(n.replace(',','.')) || 0
        } else if (n.length > 2 && !n.match(/^Total/)) {
          if (!desc) desc = n
        }
      }
      if (desc && !desc.match(/^Total/) && desc !== 'SALDO ANTERIOR') {
        const [d,m,y] = s.split('/')
        results.push({
          id: 'brad_' + results.length,
          banco: 'bradesco',
          data: `${y}-${m}-${d}`,
          descricao: desc,
          categoria: 'Outros',
          tipo: 'Compra',
          valor: -Math.abs(val),
          titular: 'Cartao ' + holder,
        })
      }
    }
  }
  return results
}
