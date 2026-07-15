/**
 * About.jsx — Informasi tentang aplikasi SmartTicket dan teori yang digunakan.
 */
import { motion } from 'framer-motion'
import {
  Info, Cpu, FileText, GitBranch, Layers,
  BookOpen, Code2, Ticket, Users, Zap
} from 'lucide-react'

const MODULES = [
  {
    icon: Cpu,
    color: '#6366f1',
    title: 'Finite State Automata',
    sub: 'DFA & NFA',
    desc: 'Mengimplementasikan DFA dan NFA untuk memodelkan alur transaksi pembelian tiket kereta api. Dilengkapi konversi NFA→DFA dan animasi langkah per langkah.',
  },
  {
    icon: FileText,
    color: '#06b6d4',
    title: 'Regular Expression',
    sub: 'Regex & NFA',
    desc: 'Validasi format kode tiket, nomor kursi, dan tanggal menggunakan Thompson\'s Construction untuk konversi Regex→NFA, serta ekstraksi Regular Grammar.',
  },
  {
    icon: GitBranch,
    color: '#a855f7',
    title: 'PDA & Context-Free Grammar',
    sub: 'Pushdown Automata',
    desc: 'Simulasi Pushdown Automata untuk memodelkan struktur tiket bersarang. Dilengkapi derivasi grammar dan visualisasi parse tree.',
  },
  {
    icon: Layers,
    color: '#f59e0b',
    title: 'Chomsky Normal Form',
    sub: 'CNF Converter',
    desc: 'Konversi CFG ke bentuk Chomsky Normal Form (CNF) secara otomatis: eliminasi unit production, epsilon production, dan symbol tidak produktif.',
  },
]

const TEAM = [
  { name: 'SmartTicket Dev Team', role: 'Pengembang Utama' },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
}

export default function About() {
  return (
    <div className="about-page">
      {/* ── Hero ── */}
      <motion.div
        className="about-hero"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="about-hero-icon">
          <Ticket size={36} color="#6366f1" />
        </div>
        <h1 className="about-hero-title">SmartTicket</h1>
        <p className="about-hero-version">v1.0.0</p>
        <p className="about-hero-sub">
          Simulator Mesin Penjual Tiket Otomatis berbasis Teori Bahasa Formal &amp; Automata.
          Dibangun sebagai media pembelajaran interaktif untuk konsep-konsep Teori Komputasi.
        </p>
      </motion.div>

      {/* ── About App ── */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
      >
        <div className="about-section-header">
          <Info size={18} color="#6366f1" />
          <h2>Tentang Aplikasi</h2>
        </div>
        <div className="about-info-card">
          <p>
            <strong>SmartTicket</strong> adalah simulasi interaktif mesin penjual tiket kereta api
            otomatis yang mengimplementasikan berbagai konsep dari <em>Teori Bahasa Formal dan Automata</em>.
            Setiap modul dirancang untuk memvisualisasikan teori secara nyata dengan konteks
            transaksi tiket yang mudah dipahami.
          </p>
          <ul>
            <li>🚉 Simulasi alur transaksi tiket dari memilih tujuan hingga cetak tiket</li>
            <li>🧠 4 modul teori yang saling terintegrasi</li>
            <li>📊 Visualisasi diagram state, parse tree, dan grammar</li>
            <li>📝 Riwayat semua simulasi tersimpan otomatis</li>
          </ul>
        </div>
      </motion.section>

      {/* ── Modules ── */}
      <section className="about-section">
        <div className="about-section-header">
          <BookOpen size={18} color="#6366f1" />
          <h2>Modul Teori</h2>
        </div>
        <div className="about-modules-grid">
          {MODULES.map((m, i) => (
            <motion.div
              key={m.title}
              className="about-module-card"
              style={{ '--m-color': m.color }}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4 }}
            >
              <span className="about-module-icon" style={{ background: `${m.color}22`, color: m.color }}>
                <m.icon size={22} />
              </span>
              <div>
                <p className="about-module-title">{m.title}</p>
                <p className="about-module-sub">{m.sub}</p>
                <p className="about-module-desc">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        <div className="about-section-header">
          <Zap size={18} color="#6366f1" />
          <h2>Tech Stack</h2>
        </div>
        <div className="about-tech-grid">
          {[
            { label: 'Frontend', value: 'React + Vite', color: '#06b6d4' },
            { label: 'Backend', value: 'Flask (Python)', color: '#10b981' },
            { label: 'Database', value: 'SQLite + SQLAlchemy', color: '#a855f7' },
            { label: 'Animation', value: 'Framer Motion', color: '#f59e0b' },
            { label: 'Icons', value: 'Lucide React', color: '#6366f1' },
            { label: 'HTTP Client', value: 'Axios', color: '#f43f5e' },
          ].map(t => (
            <div key={t.label} className="about-tech-item" style={{ '--t-color': t.color }}>
              <span className="about-tech-label">{t.label}</span>
              <span className="about-tech-value" style={{ color: t.color }}>{t.value}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── Team ── */}
      <motion.section
        className="about-section"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      >
        <div className="about-section-header">
          <Users size={18} color="#6366f1" />
          <h2>Tim Pengembang</h2>
        </div>
        <div className="about-team">
          {TEAM.map(t => (
            <div key={t.name} className="about-team-card">
              <div className="about-team-avatar">
                <Code2 size={24} color="#6366f1" />
              </div>
              <div>
                <p className="about-team-name">{t.name}</p>
                <p className="about-team-role">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <style>{`
        .about-page { max-width: 860px; margin: 0 auto; padding: 2rem 1rem 4rem; }

        .about-hero { text-align: center; padding: 2.5rem 1rem 2rem; }
        .about-hero-icon { width: 72px; height: 72px; border-radius: 20px; background: rgba(99,102,241,.15); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; border: 1px solid rgba(99,102,241,.3); }
        .about-hero-title { font-size: 2.2rem; font-weight: 800; color: #f1f5f9; margin: 0; letter-spacing: -.5px; }
        .about-hero-version { display: inline-block; background: rgba(99,102,241,.15); color: #818cf8; border-radius: 20px; padding: .2rem .75rem; font-size: .8rem; font-weight: 600; margin: .4rem 0 1rem; border: 1px solid rgba(99,102,241,.25); }
        .about-hero-sub { color: #94a3b8; max-width: 560px; margin: 0 auto; line-height: 1.7; font-size: .95rem; }

        .about-section { margin-bottom: 2.5rem; }
        .about-section-header { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
        .about-section-header h2 { font-size: 1.1rem; font-weight: 700; color: #e2e8f0; margin: 0; }

        .about-info-card { background: rgba(15,23,42,.8); border: 1px solid rgba(99,102,241,.2); border-radius: 14px; padding: 1.25rem 1.5rem; }
        .about-info-card p { color: #cbd5e1; line-height: 1.75; margin: 0 0 .75rem; font-size: .95rem; }
        .about-info-card ul { color: #94a3b8; padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: .4rem; font-size: .9rem; line-height: 1.6; }
        .about-info-card strong { color: #f1f5f9; }
        .about-info-card em { color: #818cf8; font-style: normal; font-weight: 600; }

        .about-modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1rem; }
        .about-module-card { display: flex; gap: 1rem; background: rgba(15,23,42,.8); border: 1px solid rgba(255,255,255,.07); border-left: 3px solid var(--m-color); border-radius: 14px; padding: 1.1rem 1.2rem; }
        .about-module-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .about-module-title { font-size: .95rem; font-weight: 700; color: #f1f5f9; margin: 0 0 .1rem; }
        .about-module-sub { font-size: .78rem; font-weight: 600; color: var(--m-color); margin: 0 0 .5rem; text-transform: uppercase; letter-spacing: .5px; }
        .about-module-desc { font-size: .85rem; color: #94a3b8; margin: 0; line-height: 1.6; }

        .about-tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: .75rem; }
        .about-tech-item { background: rgba(15,23,42,.8); border: 1px solid rgba(255,255,255,.07); border-top: 2px solid var(--t-color); border-radius: 12px; padding: .9rem 1rem; display: flex; flex-direction: column; gap: .25rem; }
        .about-tech-label { font-size: .75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .5px; }
        .about-tech-value { font-size: .95rem; font-weight: 700; }

        .about-team { display: flex; flex-wrap: wrap; gap: .75rem; }
        .about-team-card { display: flex; align-items: center; gap: .9rem; background: rgba(15,23,42,.8); border: 1px solid rgba(99,102,241,.2); border-radius: 14px; padding: .9rem 1.2rem; }
        .about-team-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(99,102,241,.15); display: flex; align-items: center; justify-content: center; }
        .about-team-name { font-size: .95rem; font-weight: 700; color: #f1f5f9; margin: 0 0 .1rem; }
        .about-team-role { font-size: .8rem; color: #64748b; margin: 0; }

        @media (max-width: 600px) {
          .about-modules-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  )
}
