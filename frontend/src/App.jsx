/**
 * App.jsx — Root router for SmartTicket.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import FiniteAutomata from './pages/FiniteAutomata'
import RegularExpression from './pages/RegularExpression'
import PdaCfg from './pages/PdaCfg'
import CnfConverter from './pages/CnfConverter'
import SimulationHistory from './pages/SimulationHistory'
import About from './pages/About'

export default function App() {
  return (
    <BrowserRouter>
      {/* Global Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(13, 21, 38, 0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#f1f5f9' },
          },
        }}
      />

      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/finite-automata" element={<FiniteAutomata />} />
          <Route path="/regular-expression" element={<RegularExpression />} />
          <Route path="/pda-cfg" element={<PdaCfg />} />
          <Route path="/cnf-converter" element={<CnfConverter />} />
          <Route path="/history" element={<SimulationHistory />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
