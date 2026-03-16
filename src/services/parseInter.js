import { categorizar } from '../utils/categorizar'

export function parseInter(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const results = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''))
    if (cols.length < 5) continue

    const [dataRaw, descricao, , tipo, valorRaw] = cols
    if (!dataRaw || !descricao) continue

    // Valida data DD/MM/YYYY
    if (!dataRaw.match(/^\d{2}\/\d{2}\/\d{4}$/)) continue

    // Parseia valor — remove R$, espaços, pontos de milhar
    const isNegativo = valorRaw.includes('-')
    const valorLimpo = valorRaw
      .replace(/[R$\s\-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
    const valor = parseFloat(valorLimpo)
    if (isNaN(valor)) continue

    // Parseia data DD/MM/YYYY → YYYY-MM-DD
    const [d, m, a] = dataRaw.split('/')
    const dataISO = `${a}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`

    // Se tem - é estorno/pagamento = valor positivo no app
    // Se não tem - é compra = valor negativo no app
    const isEstorno = isNegativo
    results.push({
      id: `inter_${i}`,
      banco: 'inter',
      data: dataISO,
      descricao,
      categoria: categorizar(descricao),
      tipo: tipo || '',
      valor: isEstorno ? valor : -valor,
    })
  }

  return results
}
