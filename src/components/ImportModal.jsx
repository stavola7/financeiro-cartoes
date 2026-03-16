import { useState, useRef } from 'react'
import { parseInter } from '../services/parseInter'
import { parseBradesco } from '../services/parseBradesco'

export default function ImportModal({ onImportado }) {
  const [banco, setBanco] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [arquivo, setArquivo] = useState(null)
  const inputRef = useRef()

  function abrirModal(file) {
    setArquivo(file)
    if (file.name.endsWith('.csv')) setBanco('inter')
    else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) setBanco('bradesco')
    else setBanco(null)
    setModalAberto(true)
  }

  function processarArquivo() {
    if (!arquivo || !banco) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const txs = banco === 'inter'
          ? parseInter(e.target.result)
          : parseBradesco(e.target.result)
        if (txs.length === 0) { alert('Nenhuma transação encontrada'); return }
        setModalAberto(false)
        onImportado(txs)
      } catch (err) {
        alert('Erro ao processar arquivo: ' + err.message)
      }
    }
    if (banco === 'bradesco' && arquivo.name.endsWith('.xls')) {
        reader.readAsBinaryString(arquivo)
}   else {
        reader.readAsText(arquivo, 'latin-1')
}
    
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 0 32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Importar fatura</h1>
        <p style={{ color: '#8b90b0' }}>Selecione o arquivo CSV do Inter ou XLS do Bradesco</p>
      </div>

      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); abrirModal(e.dataTransfer.files[0]) }}
        style={{ border: '2px dashed #2e3350', borderRadius: '12px', padding: '60px 40px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = '#6c63ff'}
        onMouseLeave={e => e.currentTarget.style.borderColor = '#2e3350'}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
        <p style={{ color: '#e8eaf6', fontWeight: '600', marginBottom: '6px' }}>Clique para selecionar ou arraste aqui</p>
        <p style={{ color: '#8b90b0', fontSize: '13px' }}>Aceita: CSV (Inter) e XLS (Bradesco)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={e => abrirModal(e.target.files[0])}
        />
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1a1d27', border: '1px solid #2e3350', borderRadius: '12px', padding: '32px', width: '420px', maxWidth: '95vw' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Qual banco é essa fatura?</h2>
            <p style={{ color: '#8b90b0', fontSize: '14px', marginBottom: '24px' }}>Arquivo: {arquivo?.name}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
              {[
                { id: 'inter', label: 'Banco Inter', cor: '#ff6b35', desc: 'Arquivo CSV' },
                { id: 'bradesco', label: 'Bradesco', cor: '#ff4d5e', desc: 'Arquivo XLS' },
              ].map(b => (
                <div
                  key={b.id}
                  onClick={() => setBanco(b.id)}
                  style={{ border: `2px solid ${banco === b.id ? '#6c63ff' : '#2e3350'}`, borderRadius: '12px', padding: '20px 16px', cursor: 'pointer', textAlign: 'center', background: banco === b.id ? 'rgba(108,99,255,0.1)' : 'transparent' }}
                >
                  <div style={{ fontSize: '24px', fontWeight: '900', color: b.cor, marginBottom: '8px' }}>{b.id === 'inter' ? '⬡' : '◆'}</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{b.label}</div>
                  <div style={{ color: '#8b90b0', fontSize: '11px', marginTop: '3px' }}>{b.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalAberto(false)} style={{ background: 'transparent', color: '#8b90b0', border: '1px solid #2e3350', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={processarArquivo} disabled={!banco} style={{ background: banco ? '#6c63ff' : '#333', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: banco ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
                Processar →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}