import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ImportModal from '../components/ImportModal'
import TabelaConferencia from '../components/TabelaConferencia'
import { supabase } from '../services/supabase'

export default function Importar() {
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState('upload')
  const [transacoes, setTransacoes] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [mesReferencia, setMesReferencia] = useState('')
  const [modalMes, setModalMes] = useState(false)
  const [txsPendentes, setTxsPendentes] = useState([])

  function onImportado(txs) {
    setTxsPendentes(txs)
    // Sugere mês atual
    const hoje = new Date()
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    setMesReferencia(`${hoje.getFullYear()}-${mes}`)
    setModalMes(true)
  }

  function confirmarMes() {
    if (!mesReferencia) return
    // Sobrescreve a data de todas as transações com o mês de referência
    const [ano, mes] = mesReferencia.split('-')
    const txsAtualizadas = txsPendentes.map(tx => {
      const diaOriginal = tx.data?.split('-')[2] || '01'
      return {
        ...tx,
        data: `${ano}-${mes}-${diaOriginal}`,
        mes_referencia: mesReferencia,
      }
    })
    setTransacoes(txsAtualizadas)
    setModalMes(false)
    setEtapa('conferir')
  }

  async function confirmarImportacao() {
    setSalvando(true)
    const registros = transacoes.map(t => ({
      banco: t.banco,
      mes_referencia: t.mes_referencia || mesReferencia,
      data_transacao: t.data,
      descricao: t.descricao,
      categoria: t.categoria,
      valor: t.valor,
      parcela: t.tipo || '',
    }))

    try {
      const { error } = await supabase.from('faturas').insert(registros)
      setSalvando(false)

      if (error) {
        alert('Erro ao salvar: ' + error.message)
      } else {
        alert(`${registros.length} transações salvas com sucesso!`)
        navigate('/')
      }
    } catch (err) {
      setSalvando(false)
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        alert('Erro de conexão: o banco de dados Supabase pode estar pausado ou fora do ar.\n\nAcesse supabase.com/dashboard e verifique se o projeto está ativo.')
      } else {
        alert('Erro ao salvar: ' + err.message)
      }
    }
  }

  const mesesOpcoes = () => {
    const opcoes = []
    const hoje = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      opcoes.push({ val, label })
    }
    return opcoes
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e8eaf6' }}>
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2e3350', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>
          Finance<span style={{ color: '#9d97ff' }}>Flow</span>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#8b90b0', border: '1px solid #2e3350', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
          ← Voltar
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
        {etapa === 'upload' && <ImportModal onImportado={onImportado} />}
        {etapa === 'conferir' && (
          <TabelaConferencia
            transacoes={transacoes}
            onAtualizar={setTransacoes}
            onConfirmar={confirmarImportacao}
            onVoltar={() => setEtapa('upload')}
            salvando={salvando}
          />
        )}
      </div>

      {/* Modal de mês de referência */}
      {modalMes && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '32px', width: '440px', maxWidth: '95vw' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Qual é o mês desta fatura?</h2>
            <p style={{ color: '#8b90b0', fontSize: '14px', marginBottom: '24px' }}>
              Selecione o mês de referência para organizar no dashboard corretamente.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {mesesOpcoes().map(({ val, label }) => (
                <div
                  key={val}
                  onClick={() => setMesReferencia(val)}
                  style={{
                    border: `2px solid ${mesReferencia === val ? '#6c63ff' : '#2e3350'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: mesReferencia === val ? 'rgba(108,99,255,0.1)' : 'transparent',
                    fontSize: '13px',
                    fontWeight: mesReferencia === val ? '600' : '400',
                    color: mesReferencia === val ? '#9d97ff' : '#8b90b0',
                    textTransform: 'capitalize',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setModalMes(false); setTxsPendentes([]) }}
                style={{ background: 'transparent', color: '#8b90b0', border: '1px solid #2e3350', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarMes}
                disabled={!mesReferencia}
                style={{ background: '#6c63ff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Confirmar →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}