import { CATEGORIAS } from '../utils/categorizar'

export default function TabelaConferencia({ transacoes, onAtualizar, onConfirmar, onVoltar, salvando }) {
  const total = transacoes.filter(t => t.valor < 0).reduce((s, t) => s + Math.abs(t.valor), 0)

  function atualizar(id, campo, valor) {
    onAtualizar(transacoes.map(t => t.id === id ? { ...t, [campo]: valor } : t))
  }

  function remover(id) {
    onAtualizar(transacoes.filter(t => t.id !== id))
  }

  function formatBRL(v) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Conferir transações</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onVoltar} style={{ background: 'transparent', color: '#8b90b0', border: '1px solid #2e3350', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
            ← Voltar
          </button>
          <button onClick={onConfirmar} disabled={salvando} style={{ background: '#6c63ff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            {salvando ? 'Salvando...' : `Confirmar e salvar (${transacoes.length})`}
          </button>
        </div>
      </div>

      <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#555a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total de gastos</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#ff4d5e' }}>{formatBRL(total)}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#555a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transações</div>
          <div style={{ fontSize: '22px', fontWeight: '700' }}>{transacoes.length}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: '#555a7a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Banco</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: transacoes[0]?.banco === 'inter' ? '#ff6b35' : '#ff4d5e' }}>
            {transacoes[0]?.banco === 'inter' ? 'Inter' : 'Bradesco'}
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #2e3350' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#22263a' }}>
              {['#', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', ''].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#8b90b0', fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transacoes.map((tx, i) => (
              <tr key={tx.id} style={{ borderTop: '1px solid #2e3350' }}>
                <td style={{ padding: '10px 14px', color: '#555a7a' }}>{i + 1}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{tx.data}</td>
                <td style={{ padding: '10px 14px' }}>
                  <input
                    value={tx.descricao}
                    onChange={e => atualizar(tx.id, 'descricao', e.target.value)}
                    style={{ background: 'transparent', border: '1px solid transparent', borderRadius: '4px', color: '#e8eaf6', fontSize: '13px', padding: '2px 6px', width: '100%', minWidth: '160px' }}
                    onFocus={e => e.target.style.borderColor = '#6c63ff'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <select
                    value={tx.categoria}
                    onChange={e => atualizar(tx.id, 'categoria', e.target.value)}
                    style={{ background: '#22263a', border: '1px solid #2e3350', borderRadius: '4px', color: '#e8eaf6', fontSize: '13px', padding: '2px 6px', cursor: 'pointer' }}
                  >
                    {CATEGORIAS.map(c => (
                      <option key={c.nome} value={c.nome}>{c.icone} {c.nome}</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '10px 14px', color: '#8b90b0', fontSize: '12px' }}>{tx.tipo}</td>
                <td style={{ padding: '10px 14px', fontWeight: '600', color: tx.valor >= 0 ? '#00c896' : '#ff4d5e' }}>
                  {formatBRL(tx.valor)}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => remover(tx.id)} style={{ background: 'transparent', color: '#ff4d5e', border: '1px solid #ff4d5e', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}