"""
dfa_nfa.py — DFA and NFA simulation engine for SmartTicket.

Implements:
  - DFA simulation with step-by-step trace
  - NFA simulation with epsilon-closure
  - NFA to DFA conversion (Subset Construction)
  - Pre-built SmartTicket ticket-purchase DFA (q0–q9)
"""

from collections import defaultdict, deque


# ---------------------------------------------------------------------------
# Pre-built SmartTicket DFA definition
# ---------------------------------------------------------------------------

SMARTTICKET_DFA = {
    "states": ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9"],
    "alphabet": ["pilih_tujuan", "pilih_kelas", "pilih_jumlah", "hitung", "bayar", "valid", "cetak", "kembalian", "selesai"],
    "transitions": {
        "q0": {"pilih_tujuan": "q1"},
        "q1": {"pilih_kelas": "q2"},
        "q2": {"pilih_jumlah": "q3"},
        "q3": {"hitung": "q4"},
        "q4": {"bayar": "q5"},
        "q5": {"valid": "q6"},
        "q6": {"cetak": "q7"},
        "q7": {"kembalian": "q8"},
        "q8": {"selesai": "q9"},
        "q9": {},
    },
    "start_state": "q0",
    "final_states": ["q9"],
    "state_descriptions": {
        "q0": "Idle — Menunggu pengguna",
        "q1": "Pilih Tujuan",
        "q2": "Pilih Kelas",
        "q3": "Pilih Jumlah Tiket",
        "q4": "Hitung Harga",
        "q5": "Pembayaran",
        "q6": "Validasi Pembayaran",
        "q7": "Cetak Tiket",
        "q8": "Kembalian",
        "q9": "Selesai ✓",
    }
}


# ---------------------------------------------------------------------------
# DFA Simulation
# ---------------------------------------------------------------------------

def simulate_dfa(states, alphabet, transitions, start_state, final_states, input_string):
    """
    Simulate a DFA on the given input string.

    Args:
        states (list): List of state names.
        alphabet (list): List of valid input symbols.
        transitions (dict): Nested dict {state: {symbol: next_state}}.
        start_state (str): Initial state.
        final_states (list): List of accepting states.
        input_string (str): Space-separated symbols or comma-separated.

    Returns:
        dict: {
            accepted (bool),
            trace (list of {step, current_state, symbol, next_state}),
            final_state (str),
            error (str or None)
        }
    """
    # Parse input string — support space or comma separated
    if "," in input_string:
        symbols = [s.strip() for s in input_string.split(",") if s.strip()]
    else:
        symbols = [s.strip() for s in input_string.split() if s.strip()]

    current_state = start_state
    trace = []

    # Add initial state entry
    trace.append({
        "step": 0,
        "current_state": current_state,
        "symbol": None,
        "next_state": None,
        "description": f"Mulai di state {current_state}"
    })

    for i, symbol in enumerate(symbols):
        # Validate symbol is in alphabet
        if symbol not in alphabet:
            return {
                "accepted": False,
                "trace": trace,
                "final_state": current_state,
                "error": f"Symbol '{symbol}' tidak ada dalam alfabet."
            }

        state_transitions = transitions.get(current_state, {})
        next_state = state_transitions.get(symbol)

        if next_state is None:
            # Dead/trap state — no transition
            trace.append({
                "step": i + 1,
                "current_state": current_state,
                "symbol": symbol,
                "next_state": "∅",
                "description": f"Tidak ada transisi dari {current_state} dengan '{symbol}' → REJECT"
            })
            return {
                "accepted": False,
                "trace": trace,
                "final_state": current_state,
                "error": None
            }

        trace.append({
            "step": i + 1,
            "current_state": current_state,
            "symbol": symbol,
            "next_state": next_state,
            "description": f"δ({current_state}, {symbol}) = {next_state}"
        })
        current_state = next_state

    accepted = current_state in final_states
    return {
        "accepted": accepted,
        "trace": trace,
        "final_state": current_state,
        "error": None
    }


# ---------------------------------------------------------------------------
# NFA Epsilon-Closure and Simulation
# ---------------------------------------------------------------------------

def epsilon_closure(state, transitions):
    """
    Compute the epsilon-closure of a state in an NFA.

    Args:
        state (str): Starting state.
        transitions (dict): NFA transitions {state: {symbol: [list of states]}}.
                            Use "ε" or "eps" as key for epsilon transitions.

    Returns:
        frozenset: All states reachable via epsilon transitions.
    """
    closure = set()
    stack = [state]
    while stack:
        s = stack.pop()
        if s not in closure:
            closure.add(s)
            eps_targets = transitions.get(s, {}).get("ε", [])
            eps_targets += transitions.get(s, {}).get("eps", [])
            for t in eps_targets:
                if t not in closure:
                    stack.append(t)
    return frozenset(closure)


def epsilon_closure_set(states, transitions):
    """Compute epsilon-closure for a set of states."""
    result = set()
    for s in states:
        result |= set(epsilon_closure(s, transitions))
    return frozenset(result)


def simulate_nfa(states, alphabet, transitions, start_state, final_states, input_string):
    """
    Simulate an NFA on the given input string using subset simulation.

    Args:
        transitions (dict): NFA transitions {state: {symbol: [list of states]}}.

    Returns:
        dict: {accepted, trace, final_states_reached, error}
    """
    if "," in input_string:
        symbols = [s.strip() for s in input_string.split(",") if s.strip()]
    else:
        symbols = [s.strip() for s in input_string.split() if s.strip()]

    current_states = epsilon_closure(start_state, transitions)
    trace = []

    trace.append({
        "step": 0,
        "current_states": list(current_states),
        "symbol": None,
        "next_states": None,
        "description": f"ε-closure({{{start_state}}}) = {{{', '.join(sorted(current_states))}}}"
    })

    for i, symbol in enumerate(symbols):
        if symbol not in alphabet and symbol not in ("ε", "eps"):
            return {
                "accepted": False,
                "trace": trace,
                "final_states_reached": list(current_states),
                "error": f"Symbol '{symbol}' tidak ada dalam alfabet."
            }

        # Compute move(current_states, symbol)
        moved = set()
        for s in current_states:
            targets = transitions.get(s, {}).get(symbol, [])
            moved.update(targets)

        # Apply epsilon-closure
        next_states = epsilon_closure_set(moved, transitions)

        trace.append({
            "step": i + 1,
            "current_states": list(current_states),
            "symbol": symbol,
            "next_states": list(next_states),
            "description": f"ε-closure(δ({{{', '.join(sorted(current_states))}}}, {symbol})) = {{{', '.join(sorted(next_states)) if next_states else '∅'}}}"
        })

        current_states = next_states

        if not current_states:
            return {
                "accepted": False,
                "trace": trace,
                "final_states_reached": [],
                "error": None
            }

    accepted = bool(current_states & set(final_states))
    return {
        "accepted": accepted,
        "trace": trace,
        "final_states_reached": list(current_states),
        "error": None
    }


# ---------------------------------------------------------------------------
# NFA to DFA Conversion (Subset Construction Algorithm)
# ---------------------------------------------------------------------------

def nfa_to_dfa(states, alphabet, nfa_transitions, start_state, nfa_final_states):
    """
    Convert an NFA to a DFA using the Subset Construction algorithm.

    Args:
        states (list): NFA states.
        alphabet (list): Input alphabet (excluding epsilon).
        nfa_transitions (dict): NFA transitions {state: {symbol: [states]}}.
        start_state (str): NFA start state.
        nfa_final_states (list): NFA accepting states.

    Returns:
        dict: {
            dfa_states, dfa_transitions, dfa_start, dfa_finals,
            state_mapping (DFA state name → NFA subset), steps
        }
    """
    clean_alpha = [a for a in alphabet if a not in ("ε", "eps")]

    # Map frozenset of NFA states → DFA state name
    def state_name(subset):
        if not subset:
            return "∅"
        return "{" + ",".join(sorted(subset)) + "}"

    start_closure = epsilon_closure(start_state, nfa_transitions)
    start_dfa = state_name(start_closure)

    dfa_states = {}        # name → frozenset
    dfa_transitions = {}   # name → {symbol: name}
    queue = deque([start_closure])
    visited = set()
    steps = []

    dfa_states[start_dfa] = start_closure

    while queue:
        current_subset = queue.popleft()
        current_name = state_name(current_subset)

        if current_name in visited:
            continue
        visited.add(current_name)
        dfa_transitions[current_name] = {}

        for symbol in clean_alpha:
            # move(current_subset, symbol)
            moved = set()
            for s in current_subset:
                targets = nfa_transitions.get(s, {}).get(symbol, [])
                moved.update(targets)

            next_subset = epsilon_closure_set(moved, nfa_transitions)
            next_name = state_name(next_subset)

            dfa_transitions[current_name][symbol] = next_name
            steps.append({
                "from": current_name,
                "symbol": symbol,
                "to": next_name,
                "move_result": list(moved),
                "closure_result": list(next_subset)
            })

            if next_subset and next_name not in dfa_states:
                dfa_states[next_name] = next_subset
                queue.append(next_subset)

    # Determine DFA final states
    dfa_finals = [
        name for name, subset in dfa_states.items()
        if subset & set(nfa_final_states)
    ]

    return {
        "dfa_states": list(dfa_states.keys()),
        "dfa_transitions": dfa_transitions,
        "dfa_start": start_dfa,
        "dfa_finals": dfa_finals,
        "state_mapping": {k: list(v) for k, v in dfa_states.items()},
        "steps": steps
    }


def get_smartticket_dfa():
    """Return the pre-built SmartTicket DFA definition."""
    return SMARTTICKET_DFA
