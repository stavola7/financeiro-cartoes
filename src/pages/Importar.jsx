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

  function onImportado(txs) {
    setTransacoes(txs)
    setEtapa('conferir')
  }

  async function confirmarImportacao() {
    setSalvando(true)
    const registros = transacoes.map(t => ({
      banco: t.banco,
      mes_referencia: t.data?.substring(0, 7) || '',
      data_transacao: t.data,
      descricao: t.descricao,
      categoria: t.categoria,
      valor: t.valor,
      parcela: t.tipo || '',
    }))

    const { error } = await supabase.from('faturas').insert(registros)
    setSalvando(false)

    if (error) {
      alert('Erro ao salvar: ' + error.message)
    } else {
      alert(`${registros.length} transações salvas com sucesso!`)
      navigate('/')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e8eaf6' }}>
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2e3350', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>
          Finance<span style={{ color: '#9d97ff' }}>Flow</span>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{ background: 'transparent', color: '#8b90b0', border: '1px solid #2e3350', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
        >
          ← Voltar
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
        {etapa === 'upload' && (
          <ImportModal onImportado={onImportado} />
        )}
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
    </div>
  )
}