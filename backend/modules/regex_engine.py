"""
regex_engine.py — Regular Expression engine for SmartTicket.

Implements:
  - Thompson's Construction: Regex → NFA
  - NFA to DFA conversion
  - Regular Grammar extraction from NFA
  - SmartTicket-specific pattern validation
"""

import re
from collections import defaultdict, deque


# ---------------------------------------------------------------------------
# SmartTicket Predefined Patterns
# ---------------------------------------------------------------------------

SMARTTICKET_PATTERNS = {
    "kode_tiket": {
        "pattern": r"^TKT-\d{4}-\d{6}$",
        "description": "Kode Tiket (cth: TKT-2026-000123)",
        "example": "TKT-2026-000123"
    },
    "kode_stasiun": {
        "pattern": r"^[A-Z]{2,4}$",
        "description": "Kode Stasiun (cth: BDG, JKT, YK)",
        "example": "BDG"
    },
    "tanggal": {
        "pattern": r"^\d{2}-\d{2}-\d{4}$",
        "description": "Tanggal (cth: 14-07-2026)",
        "example": "14-07-2026"
    },
    "nomor_kursi": {
        "pattern": r"^[A-Z]\d{1,2}$",
        "description": "Nomor Kursi (cth: A12, B3)",
        "example": "A12"
    },
    "harga": {
        "pattern": r"^\d{1,3}(\.\d{3})*$",
        "description": "Harga (cth: 150.000, 1.200.000)",
        "example": "150.000"
    }
}


def validate_with_python_regex(pattern, test_string):
    """
    Validate a string against a Python-compatible regex pattern.

    Returns:
        dict: {matched (bool), groups (list), span (tuple or None), error (str or None)}
    """
    try:
        m = re.fullmatch(pattern, test_string)
        if m:
            return {
                "matched": True,
                "groups": list(m.groups()),
                "span": m.span(),
                "error": None
            }
        else:
            return {"matched": False, "groups": [], "span": None, "error": None}
    except re.error as e:
        return {"matched": False, "groups": [], "span": None, "error": str(e)}


def validate_all_fields(ticket_data):
    """
    Validate all SmartTicket ticket fields at once.

    Args:
        ticket_data (dict): Keys from SMARTTICKET_PATTERNS.

    Returns:
        dict: {field: {matched, error}} for each field.
    """
    results = {}
    for field, value in ticket_data.items():
        if field in SMARTTICKET_PATTERNS:
            pat = SMARTTICKET_PATTERNS[field]["pattern"]
            results[field] = validate_with_python_regex(pat, value)
        else:
            results[field] = {"matched": False, "error": "Unknown field"}
    return results


# ---------------------------------------------------------------------------
# Thompson's Construction — Regex → NFA
# ---------------------------------------------------------------------------

class NFAState:
    """Represents a single NFA state."""
    _counter = -1

    def __init__(self):
        NFAState._counter += 1
        self.id = f"q{NFAState._counter}"
        self.transitions = defaultdict(list)  # symbol → [NFAState]

    def __repr__(self):
        return self.id


class NFA:
    """A simple NFA with a start and accept state."""
    def __init__(self, start, accept):
        self.start = start
        self.accept = accept

    def get_all_states(self):
        """BFS to collect all reachable states."""
        visited_ids = set()
        states = []
        queue = deque([self.start])
        while queue:
            s = queue.popleft()
            if s.id in visited_ids:
                continue
            visited_ids.add(s.id)
            states.append(s)
            for targets in s.transitions.values():
                for t in targets:
                    queue.append(t)
        return states


def _basic_nfa(symbol):
    """Create a basic NFA that accepts a single character."""
    start = NFAState()
    accept = NFAState()
    start.transitions[symbol].append(accept)
    return NFA(start, accept)


def _concat_nfa(nfa1, nfa2):
    """Concatenation: nfa1 followed by nfa2."""
    nfa1.accept.transitions["ε"].append(nfa2.start)
    return NFA(nfa1.start, nfa2.accept)


def _union_nfa(nfa1, nfa2):
    """Union: nfa1 | nfa2."""
    start = NFAState()
    accept = NFAState()
    start.transitions["ε"].extend([nfa1.start, nfa2.start])
    nfa1.accept.transitions["ε"].append(accept)
    nfa2.accept.transitions["ε"].append(accept)
    return NFA(start, accept)


def _kleene_nfa(nfa):
    """Kleene star: nfa*."""
    start = NFAState()
    accept = NFAState()
    start.transitions["ε"].extend([nfa.start, accept])
    nfa.accept.transitions["ε"].extend([nfa.start, accept])
    return NFA(start, accept)


def _plus_nfa(nfa):
    """One or more: nfa+."""
    start = NFAState()
    accept = NFAState()
    start.transitions["ε"].append(nfa.start)
    nfa.accept.transitions["ε"].append(accept)
    nfa.accept.transitions["ε"].append(nfa.start)
    return NFA(start, accept)


# Simplified regex→NFA using Thompson's Construction
# Supports: literals, classes, '.', '*', '+', '?', '|', '(', ')', '{n,m}'

def regex_to_nfa_visual(pattern):
    """
    Convert a regex to a visual NFA graph representation.
    Returns nodes and edges suitable for React Flow rendering.
    """
    NFAState._counter = -1  # Reset counter for clean state IDs

    tokens = _tokenize_regex(pattern)
    postfix = _infix_to_postfix(tokens)

    stack = []
    for t in postfix:
        if t == '.':
            if len(stack) >= 2:
                nfa2 = stack.pop()
                nfa1 = stack.pop()
                stack.append(_concat_nfa(nfa1, nfa2))
        elif t == '|':
            if len(stack) >= 2:
                nfa2 = stack.pop()
                nfa1 = stack.pop()
                stack.append(_union_nfa(nfa1, nfa2))
        elif t == '*':
            if stack: stack.append(_kleene_nfa(stack.pop()))
        elif t == '+':
            if stack: stack.append(_plus_nfa(stack.pop()))
        elif t == '?':
            if stack:
                eps = _basic_nfa("ε")
                stack.append(_union_nfa(stack.pop(), eps))
        elif t.startswith('{'):
            if stack:
                nfa = stack.pop()
                start = NFAState()
                accept = NFAState()
                start.transitions["ε"].append(nfa.start)
                nfa.accept.transitions["ε"].append(accept)
                nfa.accept.transitions[t].append(nfa.start)
                stack.append(NFA(start, accept))
        else:
            stack.append(_basic_nfa(t))

    if not stack:
        final_nfa = _basic_nfa("ε")
    else:
        final_nfa = stack[0]

    all_states = final_nfa.get_all_states()
    sorted_states = sorted(all_states, key=lambda s: int(s.id[1:]) if s.id[1:].isdigit() else 999)

    nodes = []
    edges = []
    states = []
    edge_id = 0

    for s in sorted_states:
        states.append(s.id)
        n_type = "normal"
        if s.id == final_nfa.start.id:
            n_type = "start"
        elif s.id == final_nfa.accept.id:
            n_type = "accept"
        nodes.append({"id": s.id, "label": s.id, "type": n_type})

        for symbol, targets in s.transitions.items():
            for t in targets:
                edges.append({
                    "id": f"e{edge_id}",
                    "source": s.id,
                    "target": t.id,
                    "label": symbol
                })
                edge_id += 1

    return {
        "nodes": nodes,
        "edges": edges,
        "states": states,
        "start": final_nfa.start.id,
        "finals": [final_nfa.accept.id]
    }


def _tokenize_regex(pattern):
    """Tokenize regex and insert explicit concatenation operators '.'"""
    tokens = []
    i = 0
    while i < len(pattern):
        c = pattern[i]
        if c in ('^', '$'):
            i += 1
            continue
        if c == '\\':
            if i + 1 < len(pattern):
                tokens.append(pattern[i:i+2])
                i += 2
            else:
                tokens.append(c)
                i += 1
        elif c == '[':
            end = pattern.find(']', i)
            if end != -1:
                tokens.append(pattern[i:end+1])
                i = end + 1
            else:
                tokens.append(c)
                i += 1
        elif c == '{':
            end = pattern.find('}', i)
            if end != -1:
                tokens.append(pattern[i:end+1])
                i = end + 1
            else:
                tokens.append(c)
                i += 1
        elif c in ('|', '*', '+', '?', '(', ')'):
            tokens.append(c)
            i += 1
        else:
            tokens.append(c)
            i += 1

    res = []
    for i, t in enumerate(tokens):
        if i > 0:
            prev = tokens[i-1]
            if prev not in ('|', '(') and t not in ('|', ')', '*', '+', '?') and not t.startswith('{'):
                res.append('.')
        res.append(t)
    return res


def _infix_to_postfix(tokens):
    """Convert infix tokens to postfix using Shunting-Yard."""
    precedence = {'|': 1, '.': 2, '*': 3, '+': 3, '?': 3}
    def get_prec(t):
        if t.startswith('{'): return 3
        return precedence.get(t, 0)

    output = []
    stack = []
    for t in tokens:
        if t == '(':
            stack.append(t)
        elif t == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            if stack:
                stack.pop()
        elif t in ('|', '.', '*', '+', '?') or t.startswith('{'):
            prec_t = get_prec(t)
            while stack and stack[-1] != '(' and get_prec(stack[-1]) >= prec_t:
                output.append(stack.pop())
            stack.append(t)
        else:
            output.append(t)
    while stack:
        output.append(stack.pop())
    return output


def nfa_to_regular_grammar(nfa_nodes, nfa_edges, start, finals):
    """
    Extract a right-linear regular grammar from an NFA graph.

    Grammar rule form:
      A → aB  (for transition A --a--> B)
      A → ε   (for accepting states)

    Returns:
        dict: {
            non_terminals (list),
            terminals (list),
            productions (dict: NT → [production strings]),
            start_symbol (str)
        }
    """
    productions = defaultdict(list)
    terminals = set()

    for edge in nfa_edges:
        src = edge["source"]
        tgt = edge["target"]
        label = edge["label"]
        if label != "ε":
            terminals.add(label)
        if tgt in finals:
            productions[src].append(f"{label}")   # A → a (terminal production)
        else:
            productions[src].append(f"{label} {tgt}")  # A → a B

    for f in finals:
        productions[f].append("ε")  # Accept state produces epsilon

    return {
        "non_terminals": [n["id"] for n in nfa_nodes],
        "terminals": list(terminals),
        "productions": dict(productions),
        "start_symbol": start
    }
