/**
 * api.js — Axios API client for SmartTicket backend.
 * All API calls go through /api (proxied to Flask on port 5000 by Vite).
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ---- Automata ----
export const getDefaultDFA = () => api.get('/automata/default')
export const simulateDFA = (payload) => api.post('/automata/simulate-dfa', payload)
export const simulateNFA = (payload) => api.post('/automata/simulate-nfa', payload)
export const nfaToDFA = (payload) => api.post('/automata/nfa-to-dfa', payload)

// ---- Regex ----
export const getRegexPatterns = () => api.get('/regex/patterns')
export const validateRegex = (payload) => api.post('/regex/validate', payload)
export const validateTicket = (payload) => api.post('/regex/validate-ticket', payload)
export const regexToNFA = (payload) => api.post('/regex/to-nfa', payload)

// ---- CFG / PDA ----
export const getDefaultCFG = () => api.get('/cfg/default')
export const simulateCFG = (payload) => api.post('/cfg/simulate', payload)
export const deriveCFG = (payload) => api.post('/cfg/derive', payload)
export const parseTree = (payload) => api.post('/cfg/parse-tree', payload)

// ---- CNF ----
export const convertCNF = (payload) => api.post('/cnf/convert', payload)
export const classifyGrammar = (payload) => api.post('/cnf/classify', payload)

// ---- History ----
export const getHistory = (params) => api.get('/history/', { params })
export const deleteHistory = (id) => api.delete(`/history/${id}`)
export const clearHistory = () => api.delete('/history/clear')
export const getHistoryStats = () => api.get('/history/stats')

// ---- Health ----
export const healthCheck = () => api.get('/health')

export default api
