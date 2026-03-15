import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Importar from './pages/Importar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/importar' element={<Importar />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
