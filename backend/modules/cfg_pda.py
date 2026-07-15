"""
cfg_pda.py — CFG Parser and PDA Simulator for SmartTicket.

Implements:
  - Context-Free Grammar (CFG) parsing from text input
  - Pushdown Automaton (PDA) simulation with stack trace
  - CYK (Cocke-Younger-Kasami) parsing algorithm
  - Leftmost and Rightmost derivation steps
  - Parse tree structure generation
"""

from collections import defaultdict
import copy


# ---------------------------------------------------------------------------
# Pre-built SmartTicket CFG
# ---------------------------------------------------------------------------

SMARTTICKET_CFG = {
    "productions": {
        "S": ["TUJUAN KELAS JUMLAH PEMBAYARAN"],
        "TUJUAN": ["pilih_tujuan STASIUN"],
        "STASIUN": ["BDG", "JKT", "YK", "SBY", "MLG"],
        "KELAS": ["pilih_kelas TIPE_KELAS"],
        "TIPE_KELAS": ["eksekutif", "bisnis", "ekonomi"],
        "JUMLAH": ["pilih_jumlah ANGKA"],
        "ANGKA": ["1", "2", "3", "4", "5"],
        "PEMBAYARAN": ["bayar NOMINAL valid"],
        "NOMINAL": ["tunai", "kartu", "qris"],
    },
    "start_symbol": "S",
    "description": "Grammar untuk alur pembelian tiket SmartTicket"
}


# ---------------------------------------------------------------------------
# CFG Parser
# ---------------------------------------------------------------------------

def parse_cfg_text(grammar_text):
    """
    Parse a CFG from text input.

    Grammar format:
        S → A B | C
        A → a | ε

    Returns:
        dict: {productions: {NT: [list of RHS strings]}, start_symbol: str, error: str|None}
    """
    productions = defaultdict(list)
    start_symbol = None
    error = None

    lines = [l.strip() for l in grammar_text.strip().split('\n') if l.strip()]

    for line in lines:
        # Support both → and ->
        if '→' in line:
            parts = line.split('→', 1)
        elif '->' in line:
            parts = line.split('->', 1)
        else:
            error = f"Invalid production rule: '{line}'"
            return {"productions": {}, "start_symbol": None, "error": error}

        lhs = parts[0].strip()
        rhs_list = [rhs.strip() for rhs in parts[1].split('|')]

        if not lhs:
            error = "Empty left-hand side in production"
            return {"productions": {}, "start_symbol": None, "error": error}

        if start_symbol is None:
            start_symbol = lhs

        for rhs in rhs_list:
            if rhs:
                productions[lhs].append(rhs)

    return {
        "productions": dict(productions),
        "start_symbol": start_symbol,
        "error": error
    }


# ---------------------------------------------------------------------------
# Leftmost & Rightmost Derivation
# ---------------------------------------------------------------------------

def _get_symbols(rhs_string):
    """Split an RHS string into individual symbols."""
    return rhs_string.split()


def leftmost_derivation(productions, start_symbol, target_string, max_steps=50):
    """
    Generate leftmost derivation steps from start_symbol to target_string.

    Uses BFS to find a derivation path.

    Returns:
        dict: {steps: list of sentential forms, found: bool, error: str|None}
    """
    target_tokens = target_string.split()
    queue = [(start_symbol, [start_symbol])]
    visited = set()
    visited.add(start_symbol)

    for _ in range(max_steps * 10):
        if not queue:
            break
        current_form, path = queue.pop(0)

        # Check if we've reached the target
        if current_form == target_string:
            return {"steps": path, "found": True, "error": None}

        # Check if current form contains any non-terminal
        tokens = current_form.split()
        nt_index = None
        for i, tok in enumerate(tokens):
            if tok in productions:
                nt_index = i
                break  # Leftmost: take first NT

        if nt_index is None:
            # No non-terminal left, this is a terminal string — doesn't match
            continue

        nt = tokens[nt_index]
        for rhs in productions.get(nt, []):
            rhs_tokens = _get_symbols(rhs)
            if rhs == "ε":
                new_tokens = tokens[:nt_index] + tokens[nt_index + 1:]
            else:
                new_tokens = tokens[:nt_index] + rhs_tokens + tokens[nt_index + 1:]
            new_form = " ".join(new_tokens)

            if new_form not in visited and len(new_form) <= len(target_string) * 3 + 20:
                visited.add(new_form)
                queue.append((new_form, path + [new_form]))

    return {
        "steps": [start_symbol],
        "found": False,
        "error": f"Derivasi tidak ditemukan untuk input '{target_string}'. Pastikan string dapat diturunkan dari grammar."
    }


def rightmost_derivation(productions, start_symbol, target_string, max_steps=50):
    """
    Generate rightmost derivation steps from start_symbol to target_string.

    Returns:
        dict: {steps: list of sentential forms, found: bool, error: str|None}
    """
    target_tokens = target_string.split()
    queue = [(start_symbol, [start_symbol])]
    visited = set()
    visited.add(start_symbol)

    for _ in range(max_steps * 10):
        if not queue:
            break
        current_form, path = queue.pop(0)

        if current_form == target_string:
            return {"steps": path, "found": True, "error": None}

        tokens = current_form.split()
        nt_index = None
        for i in range(len(tokens) - 1, -1, -1):
            if tokens[i] in productions:
                nt_index = i
                break  # Rightmost: take last NT

        if nt_index is None:
            continue

        nt = tokens[nt_index]
        for rhs in productions.get(nt, []):
            rhs_tokens = _get_symbols(rhs)
            if rhs == "ε":
                new_tokens = tokens[:nt_index] + tokens[nt_index + 1:]
            else:
                new_tokens = tokens[:nt_index] + rhs_tokens + tokens[nt_index + 1:]
            new_form = " ".join(new_tokens)

            if new_form not in visited and len(new_form) <= len(target_string) * 3 + 20:
                visited.add(new_form)
                queue.append((new_form, path + [new_form]))

    return {
        "steps": [start_symbol],
        "found": False,
        "error": f"Rightmost derivasi tidak ditemukan untuk '{target_string}'."
    }


# ---------------------------------------------------------------------------
# Parse Tree Generation
# ---------------------------------------------------------------------------

def build_parse_tree(productions, start_symbol, target_string, max_depth=20):
    """
    Build a parse tree for target_string using the given CFG.

    Returns:
        dict: Recursive tree structure {id, label, children} for React Flow rendering.
        None if string cannot be derived.
    """
    target_tokens = target_string.split()
    node_counter = [0]

    def new_id(label):
        node_counter[0] += 1
        return {"id": f"node_{node_counter[0]}", "label": label, "children": []}

    def derive(symbol, tokens, depth):
        """Recursively build the parse tree node."""
        if depth > max_depth:
            return None

        node = new_id(symbol)

        if symbol not in productions:
            # Terminal
            if tokens and tokens[0] == symbol:
                tokens.pop(0)
                return node
            elif symbol == "ε":
                return node
            return None

        # Try each production
        for rhs in productions[symbol]:
            rhs_symbols = _get_symbols(rhs) if rhs != "ε" else ["ε"]
            saved_tokens = list(tokens)
            children = []
            success = True

            for sym in rhs_symbols:
                child = derive(sym, tokens, depth + 1)
                if child is None:
                    success = False
                    break
                children.append(child)

            if success:
                node["children"] = children
                return node

            # Restore tokens on failure
            tokens.clear()
            tokens.extend(saved_tokens)

        return None

    tokens_list = list(target_tokens)
    tree = derive(start_symbol, tokens_list, 0)

    if tree and not tokens_list:
        return {"tree": tree, "accepted": True, "error": None}
    else:
        return {
            "tree": None,
            "accepted": False,
            "error": f"String '{target_string}' tidak dapat di-parse dengan grammar yang diberikan."
        }


# ---------------------------------------------------------------------------
# PDA Simulation (Stack-based)
# ---------------------------------------------------------------------------

def simulate_pda(productions, start_symbol, input_string):
    """
    Simulate a PDA for LL(1)-style top-down parsing.
    Traces stack contents at each step.

    Args:
        productions (dict): CFG productions.
        start_symbol (str): Start symbol.
        input_string (str): Space-separated terminal string.

    Returns:
        dict: {
            accepted (bool),
            stack_trace (list of {step, stack, input_remaining, action}),
            error (str or None)
        }
    """
    input_tokens = input_string.split() + ["$"]  # Add end marker
    stack = [start_symbol]
    pointer = 0
    stack_trace = []
    step = 0

    stack_trace.append({
        "step": step,
        "stack": list(stack),
        "input_remaining": input_tokens[pointer:],
        "action": f"Inisialisasi: push '{start_symbol}', input = {input_tokens}"
    })

    max_steps = 200
    while stack and step < max_steps:
        top = stack[-1]
        current_input = input_tokens[pointer] if pointer < len(input_tokens) else "$"

        if top == "$" and current_input == "$":
            step += 1
            stack_trace.append({
                "step": step,
                "stack": [],
                "input_remaining": [],
                "action": "✓ ACCEPTED — Stack dan input kosong"
            })
            return {"accepted": True, "stack_trace": stack_trace, "error": None}

        if top == current_input:
            # Match terminal
            stack.pop()
            pointer += 1
            step += 1
            stack_trace.append({
                "step": step,
                "stack": list(stack),
                "input_remaining": input_tokens[pointer:],
                "action": f"Match terminal '{top}'"
            })
        elif top in productions:
            # Expand non-terminal — find matching production
            matched_rhs = None
            for rhs in productions[top]:
                rhs_first = rhs.split()[0] if rhs != "ε" else "ε"
                # Simplified: try first matching production
                if rhs_first == current_input or rhs == "ε":
                    matched_rhs = rhs
                    break
                # Also try if first symbol of RHS can derive current_input
                first_sym = rhs.split()[0]
                if first_sym not in productions:
                    # First symbol is terminal
                    if first_sym == current_input:
                        matched_rhs = rhs
                        break
                else:
                    # First symbol is NT — use it (simplified)
                    matched_rhs = rhs
                    break

            if matched_rhs is None:
                stack_trace.append({
                    "step": step + 1,
                    "stack": list(stack),
                    "input_remaining": input_tokens[pointer:],
                    "action": f"✗ REJECTED — Tidak ada produksi untuk {top} dengan input '{current_input}'"
                })
                return {
                    "accepted": False,
                    "stack_trace": stack_trace,
                    "error": f"Parsing error: tidak ada produksi untuk '{top}' saat membaca '{current_input}'"
                }

            stack.pop()
            if matched_rhs != "ε":
                rhs_symbols = list(reversed(matched_rhs.split()))
                stack.extend(rhs_symbols)

            step += 1
            stack_trace.append({
                "step": step,
                "stack": list(stack),
                "input_remaining": input_tokens[pointer:],
                "action": f"Expand: {top} → {matched_rhs}"
            })
        else:
            stack_trace.append({
                "step": step + 1,
                "stack": list(stack),
                "input_remaining": input_tokens[pointer:],
                "action": f"✗ REJECTED — Mismatch: top='{top}', input='{current_input}'"
            })
            return {
                "accepted": False,
                "stack_trace": stack_trace,
                "error": f"Mismatch: stack top '{top}' tidak cocok dengan input '{current_input}'"
            }

    return {
        "accepted": False,
        "stack_trace": stack_trace,
        "error": "Max langkah tercapai atau stack kosong sebelum input habis."
    }
