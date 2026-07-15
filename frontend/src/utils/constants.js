/**
 * constants.js — Shared constants for SmartTicket frontend.
 */

export const SMARTTICKET_DFA_EXAMPLE = {
  states: ['q0','q1','q2','q3','q4','q5','q6','q7','q8','q9'],
  alphabet: ['pilih_tujuan','pilih_kelas','pilih_jumlah','hitung','bayar','valid','cetak','kembalian','selesai'],
  transitions: {
    q0: { pilih_tujuan: 'q1' },
    q1: { pilih_kelas: 'q2' },
    q2: { pilih_jumlah: 'q3' },
    q3: { hitung: 'q4' },
    q4: { bayar: 'q5' },
    q5: { valid: 'q6' },
    q6: { cetak: 'q7' },
    q7: { kembalian: 'q8' },
    q8: { selesai: 'q9' },
    q9: {},
  },
  start_state: 'q0',
  final_states: ['q9'],
}

export const SMARTTICKET_NFA_EXAMPLE = {
  states: ['q0','q1','q2','q3'],
  alphabet: ['a','b'],
  transitions: {
    q0: { a: ['q0','q1'], ε: [] },
    q1: { b: ['q2'], ε: [] },
    q2: { b: ['q3'], ε: [] },
    q3: {},
  },
  start_state: 'q0',
  final_states: ['q3'],
}

export const SMARTTICKET_CFG_TEXT = `S → TUJUAN KELAS JUMLAH PEMBAYARAN
TUJUAN → pilih_tujuan STASIUN
STASIUN → BDG | JKT | YK | SBY
KELAS → pilih_kelas TIPE_KELAS
TIPE_KELAS → eksekutif | bisnis | ekonomi
JUMLAH → pilih_jumlah ANGKA
ANGKA → 1 | 2 | 3
PEMBAYARAN → bayar NOMINAL valid
NOMINAL → tunai | kartu | qris`

export const SMARTTICKET_CNF_EXAMPLE = `S → A B | C D
A → a B | a
B → b C | b
C → c | ε
D → d A | d`

export const MODULE_COLORS = {
  DFA: 'indigo',
  NFA: 'purple',
  Regex: 'cyan',
  CFG: 'emerald',
  CNF: 'amber',
}

export const STATE_DESCRIPTIONS = {
  q0: 'Idle — Menunggu Pengguna',
  q1: 'Pilih Tujuan',
  q2: 'Pilih Kelas',
  q3: 'Pilih Jumlah Tiket',
  q4: 'Hitung Harga',
  q5: 'Pembayaran',
  q6: 'Validasi Pembayaran',
  q7: 'Cetak Tiket',
  q8: 'Kembalian',
  q9: 'Selesai ✓',
}
