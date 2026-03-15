import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Dashboard from '../components/Dashboard'

export default function Home() {
  const navigate = useNavigate()
  const [faturas, setFaturas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarFaturas()
  }, [])

  async function carregarFaturas() {
    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .order('data_transacao', { ascending: false })
    if (!error) setFaturas(data || [])
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', color: '#e8eaf6' }}>
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2e3350', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>
          Finance<span style={{ color: '#9d97ff' }}>Flow</span>
        </div>
        <button
          onClick={() => navigate('/importar')}
          style={{ background: '#6c63ff', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
        >
          + Importar fatura
        </button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#8b90b0' }}>Carregando...</div>
        ) : faturas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💳</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Nenhuma fatura ainda</h2>
            <p style={{ color: '#8b90b0', marginBottom: '24px' }}>Importe sua primeira fatura para começar</p>
            <button
              onClick={() => navigate('/importar')}
              style={{ background: '#6c63ff', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Importar fatura
            </button>
          </div>
        ) : (
          <Dashboard faturas={faturas} onAtualizar={carregarFaturas} />
        )}
      </div>
    </div>
  )
}