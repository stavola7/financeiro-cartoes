import { useState } from 'react'
import { getCatInfo, CATEGORIAS } from '../utils/categorizar'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard({ faturas, onAtualizar }) {
  const meses = [...new Set(faturas.map(f => f.data_transacao?.substring(0, 7)))].filter(Boolean).sort().reverse()
  const [mesSel, setMesSel] = useState(meses[0] || '')
  const [bancoFiltro, setBancoFiltro] = useState('all')

  function formatBRL(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  let txs = faturas.filter(f => f.data_transacao?.startsWith(mesSel))
  if (bancoFiltro !== 'all') txs = txs.filter(f => f.banco === bancoFiltro)
  const gastos = txs.filter(t => t.valor < 0)
  const total = gastos.reduce((s, t) => s + Math.abs(t.valor), 0)
  const totalInter = gastos.filter(t => t.banco === 'inter').reduce((s, t) => s + Math.abs(t.valor), 0)
  const totalBrad = gastos.filter(t => t.banco === 'bradesco').reduce((s, t) => s + Math.abs(t.valor), 0)

  const porCategoria = {}
  gastos.forEach(t => { porCategoria[t.categoria] = (porCategoria[t.categoria] || 0) + Math.abs(t.valor) })
  const catEntries = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])

  const pieData = catEntries.map(([name, value]) => ({ name, value }))

  const lineData = [...meses].reverse().map(m => ({
    mes: new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
    Inter: faturas.filter(f => f.data_transacao?.startsWith(m) && f.banco === 'inter' && f.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0),
    Bradesco: faturas.filter(f => f.data_transacao?.startsWith(m) && f.banco === 'bradesco' && f.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0),
  }))

  const top10 = [...gastos].sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor)).slice(0, 10)

  const card = (label, value, cor) => (
    <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '18px 20px' }}>
      <div style={{ fontSize: '11px', color: '#555a7a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-1px', color: cor || '#e8eaf6' }}>{value}</div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {meses.map(m => {
            const label = new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
            return (
              <button key={m} onClick={() => setMesSel(m)} style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', background: mesSel === m ? '#6c63ff' : '#22263a', color: mesSel === m ? 'white' : '#8b90b0', border: `1px solid ${mesSel === m ? '#6c63ff' : '#2e3350'}` }}>
                {label}
              </button>
            )
          })}
        </div>
        <select value={bancoFiltro} onChange={e => setBancoFiltro(e.target.value)} style={{ background: '#1a1d27', color: '#e8eaf6', border: '1px solid #2e3350', borderRadius: '8px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>
          <option value="all">Todos os bancos</option>
          <option value="inter">Inter</option>
          <option value="bradesco">Bradesco</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {card('Total do mês', formatBRL(total), '#9d97ff')}
        {card('Inter', formatBRL(totalInter), '#ff6b35')}
        {card('Bradesco', formatBRL(totalBrad), '#ff4d5e')}
        {card('Transações', gastos.length, '#00c896')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#8b90b0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gastos por categoria</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={getCatInfo(entry.name).cor} />)}
              </Pie>
              <Tooltip formatter={v => formatBRL(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {catEntries.slice(0, 6).map(([n, v]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#8b90b0' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: getCatInfo(n).cor }} />
                {n} {total > 0 ? (v / total * 100).toFixed(0) : 0}%
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#8b90b0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evolução mensal</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <XAxis dataKey="mes" tick={{ fill: '#8b90b0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b90b0', fontSize: 11 }} tickFormatter={v => 'R$' + (v / 1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => formatBRL(v)} />
              <Line type="monotone" dataKey="Inter" stroke="#ff6b35" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Bradesco" stroke="#ff4d5e" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#8b90b0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detalhamento por categoria</div>
        {catEntries.map(([n, v]) => {
          const ci = getCatInfo(n)
          const pct = total > 0 ? (v / total * 100) : 0
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '130px', fontSize: '13px', flexShrink: 0 }}>{ci.icone} {n}</div>
              <div style={{ flex: 1, background: '#22263a', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: pct + '%', height: '100%', background: ci.cor, borderRadius: '4px' }} />
              </div>
              <div style={{ width: '100px', textAlign: 'right', fontSize: '13px', fontWeight: '600', color: ci.cor }}>{formatBRL(v)}</div>
              <div style={{ width: '36px', textAlign: 'right', fontSize: '11px', color: '#555a7a' }}>{pct.toFixed(0)}%</div>
            </div>
          )
        })}
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#8b90b0', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Maiores gastos do mês</div>
        {top10.map(tx => {
          const ci = getCatInfo(tx.categoria)
          return (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: '1px solid #2e3350' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: ci.cor + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{ci.icone}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.descricao}</div>
                <div style={{ fontSize: '11px', color: '#555a7a' }}>{tx.categoria} • {tx.data_transacao}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#ff4d5e', flexShrink: 0 }}>{formatBRL(Math.abs(tx.valor))}</div>
              <div style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '10px', background: tx.banco === 'inter' ? 'rgba(255,107,53,0.15)' : 'rgba(255,77,94,0.15)', color: tx.banco === 'inter' ? '#ff6b35' : '#ff4d5e', flexShrink: 0 }}>
                {tx.banco === 'inter' ? 'Inter' : 'Bradesco'}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}