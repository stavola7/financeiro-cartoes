import { categorizar } from '../utils/categorizar'

export function parseBradesco(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const results = []
  const ano = new Date().getFullYear()

  // Detecta separador: ; ou ,
  const sep = lines[0].includes(';') ? ';' : ','

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/"/g, ''))
    if (cols.length < 3) continue

    const [dataRaw, descricao, valorRaw] = cols

    // Valida data DD/MM ou DD/MM/YYYY
    if (!dataRaw.match(/^\d{2}\/\d{2}/)) continue
    if (!descricao || descricao.length < 2) continue

    // Ignora linhas de resumo/total
    const ignora = ['SALDO ANTERIOR', 'PAGTO. POR DEB EM C/C', 'Total', 'Resumo']
    if (ignora.some(w => descricao.startsWith(w))) continue

    // Parseia valor
    const valorLimpo = valorRaw.replace(/\./g, '').replace(',', '.')
    const valor = parseFloat(valorLimpo)
    if (isNaN(valor) || valor === 0) continue

    // Parseia data
    const partes = dataRaw.split('/')
    const d = partes[0].padStart(2, '0')
    const m = partes[1].padStart(2, '0')
    const a = partes[2] ? partes[2] : String(ano)
    const dataISO = `${a}-${m}-${d}`

    const isEstorno = valor < 0
    results.push({
      id: `brad_${i}`,
      banco: 'bradesco',
      data: dataISO,
      descricao,
      categoria: categorizar(descricao),
      tipo: isEstorno ? 'Estorno' : 'Compra',
      valor: isEstorno ? Math.abs(valor) : -valor,
      titular: '',
    })
  }

  return results
}