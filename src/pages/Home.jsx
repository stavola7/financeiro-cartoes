import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ color: '#9d97ff', fontSize: '40px', fontWeight: '700' }}>FinanceFlow</h1>
      <p style={{ color: '#8b90b0' }}>Controle seus cartões Inter e Bradesco</p>
      <button onClick={() => navigate('/importar')} style={{ background: '#6c63ff', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>
        Importar fatura
      </button>
    </div>
  )
}