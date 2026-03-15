import Papa from 'papaparse'
import { categorizar } from '../utils/categorizar'

export function parseInter(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true })
  return result.data.map((row, i) => {
    const raw = row['Valor'] || ''
    const neg = raw.includes('-')
    const val = parseFloat(raw.replace(/[R$\s.-]/g,'').replace(',','.')) || 0
    const [d,m,y] = (row['Data']||'').split('/')
    const data = y ? `${y}-${m}-${d}` : row['Data']
    return {
      id: 'inter_' + i,
      banco: 'inter',
      data,
      descricao: row['Lancamento'] || row['Lançamento'] || '',
      categoria: categorizar(row['Lancamento'] || ''),
      tipo: row['Tipo'] || '',
      valor: neg ? -val : val,
    }
  }).filter(t => t.descricao && t.valor !== 0)
}
