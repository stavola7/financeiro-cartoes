import { categorizar } from '../utils/categorizar'

export function parseInter(text) {
  const linhas = text.split('\n')
  const resultado = []

  for (let i = 1; i < linhas.length; i++) {
    const linha = linhas[i].trim()
    if (!linha) continue

    const colunas = linha.split(',').map(c => c.replace(/"/g, '').trim())
    if (colunas.length < 5) continue

    const [data, descricao, , tipo, valorRaw] = colunas
    if (!data || !descricao) continue

    const neg = valorRaw.includes('-')
    const valorLimpo = valorRaw.replace(/[R$\s\-]/g, '').replace('.', '').replace(',', '.')
    const valor = parseFloat(valorLimpo) || 0

    const [d, m, y] = data.split('/')
    const dataISO = y ? `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` : data

    resultado.push({
      id: 'inter_' + i,
      banco: 'inter',
      data: dataISO,
      descricao,
      categoria: categorizar(descricao),
      tipo: tipo || '',
      valor: neg ? -valor : valor,
    })
  }

  return resultado.filter(t => t.descricao && t.valor !== 0)
}