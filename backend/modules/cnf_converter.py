"""
cnf_converter.py — Chomsky Normal Form (CNF) converter for SmartTicket.

Implements the full 4-step CNF transformation:
  Step 1: Remove ε-productions
  Step 2: Remove unit productions
  Step 3: Remove useless symbols (non-generating + unreachable)
  Step 4: Convert to proper CNF (TERM + BIN rules)

Also provides Chomsky Hierarchy classification.
"""

from collections import defaultdict, deque
import copy
import re as _re


# ---------------------------------------------------------------------------
# Grammar Utilities
# ---------------------------------------------------------------------------

def grammar_to_dict(productions_text):
    """
    Parse a grammar from text into a dict.
    Same format as cfg_pda.parse_cfg_text.
    """
    productions = defaultdict(list)
    start_symbol = None

    lines = [l.strip() for l in productions_text.strip().split('\n') if l.strip()]
    for line in lines:
        if '→' in line:
            lhs, rhs_str = line.split('→', 1)
        elif '->' in line:
            lhs, rhs_str = line.split('->', 1)
        else:
            continue
        lhs = lhs.strip()
        if not start_symbol:
            start_symbol = lhs
        for rhs in rhs_str.split('|'):
            rhs = rhs.strip()
            if rhs:
                productions[lhs].append(rhs)

    return dict(productions), start_symbol


def grammar_to_text(productions, start_symbol):
    """Format a grammar dict back to readable text."""
    lines = []
    # Start symbol first
    if start_symbol in productions:
        prods = productions[start_symbol]
        lines.append(f"{start_symbol} → {' | '.join(prods)}")
    for nt, prods in productions.items():
        if nt == start_symbol:
            continue
        lines.append(f"{nt} → {' | '.join(prods)}")
    return "\n".join(lines)


def is_terminal(symbol, non_terminals):
    """Check if a symbol is a terminal (not in non_terminals set)."""
    return symbol not in non_terminals and symbol != "ε"


def get_non_terminals(productions):
    return set(productions.keys())


# ---------------------------------------------------------------------------
# Step 1: Remove ε-Productions
# ---------------------------------------------------------------------------

def remove_epsilon_productions(productions, start_symbol):
    """
    Remove all ε-productions from the grammar.

    Algorithm:
    1. Find all nullable non-terminals (NT that can derive ε).
    2. For each production with a nullable NT, add new productions
       with that NT removed (all combinations).
    3. Remove the original ε-productions (keep S → ε if S is start and S is nullable).

    Returns:
        dict: New productions without ε-productions.
        list: Step descriptions.
    """
    steps = []
    prods = copy.deepcopy(productions)

    # 1. Find nullable NTs
    nullable = set()
    changed = True
    while changed:
        changed = False
        for nt, rhs_list in prods.items():
            if nt not in nullable:
                for rhs in rhs_list:
                    symbols = rhs.split()
                    if rhs == "ε" or all(s in nullable for s in symbols):
                        nullable.add(nt)
                        changed = True

    steps.append({
        "description": f"Nullable non-terminals: {{{', '.join(sorted(nullable))}}}",
        "detail": "NT yang dapat menghasilkan ε secara langsung maupun tidak langsung."
    })

    # 2. Add new productions for each combination of nullable NTs
    new_prods = defaultdict(set)
    for nt, rhs_list in prods.items():
        for rhs in rhs_list:
            if rhs == "ε":
                continue
            symbols = rhs.split()
            nullable_positions = [i for i, s in enumerate(symbols) if s in nullable]
            # Generate all subsets of nullable positions to remove
            for mask in range(1 << len(nullable_positions)):
                new_symbols = []
                skip_set = set()
                for bit, pos in enumerate(nullable_positions):
                    if mask & (1 << bit):
                        skip_set.add(pos)
                new_symbols = [s for i, s in enumerate(symbols) if i not in skip_set]
                if new_symbols:
                    new_prods[nt].add(" ".join(new_symbols))

    # Convert sets to lists
    result = {nt: sorted(list(rhs_set)) for nt, rhs_set in new_prods.items()}

    # Keep S → ε if start symbol was nullable (language contains ε)
    if start_symbol in nullable:
        if start_symbol not in result:
            result[start_symbol] = []
        result[start_symbol].append("ε")
        steps.append({
            "description": f"Start symbol '{start_symbol}' adalah nullable → tambahkan {start_symbol} → ε",
            "detail": "Bahasa mengandung string kosong."
        })

    steps.append({
        "description": "ε-productions berhasil dihapus",
        "detail": f"Grammar baru: {grammar_to_text(result, start_symbol)}"
    })

    return result, steps


# ---------------------------------------------------------------------------
# Step 2: Remove Unit Productions
# ---------------------------------------------------------------------------

def remove_unit_productions(productions, start_symbol):
    """
    Remove unit productions (A → B where B is a single non-terminal).

    Algorithm:
    1. Compute unit closure: all NTs reachable from each NT via unit productions.
    2. Replace unit productions with the productions of the reachable NT.

    Returns:
        dict: New productions without unit productions.
        list: Step descriptions.
    """
    steps = []
    prods = copy.deepcopy(productions)
    nts = get_non_terminals(prods)

    # 1. Compute unit pairs (A, B) where A ⇒* B via unit productions
    unit_pairs = {nt: {nt} for nt in nts}
    changed = True
    while changed:
        changed = False
        for a in nts:
            for rhs in prods.get(a, []):
                rhs_syms = rhs.split()
                if len(rhs_syms) == 1 and rhs_syms[0] in nts:
                    b = rhs_syms[0]
                    new_reach = unit_pairs.get(b, {b})
                    before = len(unit_pairs[a])
                    unit_pairs[a] |= new_reach
                    if len(unit_pairs[a]) > before:
                        changed = True

    steps.append({
        "description": "Unit pairs (A →* B via unit productions) dihitung",
        "detail": {nt: list(pairs) for nt, pairs in unit_pairs.items()}
    })

    # 2. Build new productions: for each (A, B) in unit_pairs, add A → γ for each B → γ (non-unit)
    result = defaultdict(set)
    for a in nts:
        for b in unit_pairs[a]:
            for rhs in prods.get(b, []):
                rhs_syms = rhs.split()
                # Only add non-unit productions
                if not (len(rhs_syms) == 1 and rhs_syms[0] in nts):
                    result[a].add(rhs)

    result = {nt: sorted(list(rhs_set)) for nt, rhs_set in result.items() if rhs_set}

    steps.append({
        "description": "Unit productions berhasil dihapus",
        "detail": grammar_to_text(result, start_symbol)
    })

    return result, steps


# ---------------------------------------------------------------------------
# Step 3: Remove Useless Symbols
# ---------------------------------------------------------------------------

def remove_useless_symbols(productions, start_symbol):
    """
    Remove useless symbols:
    (a) Non-generating: symbols that cannot derive any terminal string.
    (b) Unreachable: symbols not reachable from start symbol.

    Returns:
        dict: Clean productions.
        list: Step descriptions.
    """
    steps = []
    prods = copy.deepcopy(productions)
    nts = get_non_terminals(prods)

    # (a) Find generating symbols
    generating = set()
    # All terminals are trivially generating
    all_symbols = set()
    for rhs_list in prods.values():
        for rhs in rhs_list:
            for s in rhs.split():
                if s != "ε":
                    all_symbols.add(s)
    terminals = all_symbols - nts

    generating |= terminals

    changed = True
    while changed:
        changed = False
        for nt, rhs_list in prods.items():
            if nt not in generating:
                for rhs in rhs_list:
                    syms = rhs.split()
                    if all(s in generating or s == "ε" for s in syms):
                        generating.add(nt)
                        changed = True

    non_generating = nts - generating
    steps.append({
        "description": f"Non-generating symbols dihapus: {{{', '.join(sorted(non_generating)) or 'none'}}}",
        "detail": f"Generating symbols: {{{', '.join(sorted(generating & nts))}}}"
    })

    # Remove productions containing non-generating symbols
    clean_prods = {}
    for nt in nts - non_generating:
        clean_rhs = []
        for rhs in prods.get(nt, []):
            syms = rhs.split()
            if all(s not in non_generating for s in syms):
                clean_rhs.append(rhs)
        if clean_rhs:
            clean_prods[nt] = clean_rhs

    # (b) Find reachable symbols
    reachable = {start_symbol}
    queue = deque([start_symbol])
    while queue:
        sym = queue.popleft()
        for rhs in clean_prods.get(sym, []):
            for s in rhs.split():
                if s in clean_prods and s not in reachable:
                    reachable.add(s)
                    queue.append(s)

    unreachable = set(clean_prods.keys()) - reachable
    steps.append({
        "description": f"Unreachable symbols dihapus: {{{', '.join(sorted(unreachable)) or 'none'}}}",
        "detail": f"Reachable symbols: {{{', '.join(sorted(reachable))}}}"
    })

    result = {nt: prods for nt, prods in clean_prods.items() if nt in reachable}

    steps.append({
        "description": "Useless symbols berhasil dihapus",
        "detail": grammar_to_text(result, start_symbol)
    })

    return result, steps


# ---------------------------------------------------------------------------
# Step 4: Convert to CNF
# ---------------------------------------------------------------------------

def convert_to_cnf(productions, start_symbol):
    """
    Convert a grammar (already without ε, unit, and useless productions)
    to Chomsky Normal Form (CNF).

    CNF Rules:
      A → BC  (two non-terminals)
      A → a   (single terminal)

    Algorithm:
    1. TERM: For each terminal 'a' appearing with other symbols in an RHS,
       create a new NT T_a with production T_a → a, and replace 'a' with T_a.
    2. BIN: For each RHS with more than 2 symbols, introduce new NTs to binarize.

    Returns:
        dict: CNF productions.
        list: Step descriptions.
    """
    steps = []
    prods = copy.deepcopy(productions)
    nts = get_non_terminals(prods)
    counter = [0]

    # All symbols seen
    all_syms = set()
    for rhs_list in prods.values():
        for rhs in rhs_list:
            for s in rhs.split():
                if s != "ε":
                    all_syms.add(s)
    terminals = all_syms - nts

    # TERM: Replace terminals in mixed/long productions
    term_map = {}  # terminal → new NT
    new_prods = defaultdict(list)
    for nt, rhs_list in prods.items():
        new_prods[nt] = list(rhs_list)

    for nt, rhs_list in prods.items():
        updated_list = []
        for rhs in rhs_list:
            syms = rhs.split()
            if len(syms) == 1:
                updated_list.append(rhs)  # A → a or A → B — keep as-is
                continue
            new_syms = []
            for s in syms:
                if s in terminals:
                    if s not in term_map:
                        counter[0] += 1
                        new_nt = f"T_{s}"
                        term_map[s] = new_nt
                        new_prods[new_nt] = [s]
                        steps.append({
                            "description": f"TERM: Tambahkan {new_nt} → {s}",
                            "detail": f"Terminal '{s}' dalam RHS panjang diganti dengan {new_nt}"
                        })
                    new_syms.append(term_map[s])
                else:
                    new_syms.append(s)
            updated_list.append(" ".join(new_syms))
        new_prods[nt] = updated_list

    # BIN: Binarize productions with more than 2 symbols
    final_prods = defaultdict(list)
    bin_counter = [0]

    for nt, rhs_list in new_prods.items():
        for rhs in rhs_list:
            syms = rhs.split()
            if len(syms) <= 2:
                final_prods[nt].append(rhs)
                continue

            # Binarize: A → B C D becomes A → B X1, X1 → C D (or X1 → C X2, X2 → D ...)
            current_nt = nt
            while len(syms) > 2:
                bin_counter[0] += 1
                new_bin_nt = f"X{bin_counter[0]}"
                rest_syms = syms[1:]
                final_prods[current_nt].append(f"{syms[0]} {new_bin_nt}")
                steps.append({
                    "description": f"BIN: Tambahkan {new_bin_nt} → {' '.join(rest_syms[:2])}",
                    "detail": f"Binarisasi produksi {current_nt} → {' '.join(syms)}"
                })
                current_nt = new_bin_nt
                syms = rest_syms

            final_prods[current_nt].append(" ".join(syms))

    result = {nt: list(set(prods)) for nt, prods in final_prods.items()}

    steps.append({
        "description": "Grammar berhasil dikonversi ke CNF",
        "detail": grammar_to_text(result, start_symbol)
    })

    return result, steps


# ---------------------------------------------------------------------------
# Full CNF Conversion Pipeline
# ---------------------------------------------------------------------------

def full_cnf_conversion(grammar_text):
    """
    Run the full 4-step CNF conversion pipeline.

    Args:
        grammar_text (str): Grammar in text format.

    Returns:
        dict: {
            original, after_epsilon, after_unit, after_useless, final_cnf,
            steps (all steps from all phases),
            error (str or None)
        }
    """
    try:
        prods, start = grammar_to_dict(grammar_text)

        if not prods:
            return {"error": "Grammar tidak valid atau kosong."}

        original_text = grammar_to_text(prods, start)
        all_steps = [{"phase": "Original", "description": "Grammar awal", "detail": original_text}]

        # Step 1: Remove ε-productions
        prods1, steps1 = remove_epsilon_productions(prods, start)
        for s in steps1:
            all_steps.append({"phase": "Step 1: Hapus ε-productions", **s})

        # Step 2: Remove unit productions
        prods2, steps2 = remove_unit_productions(prods1, start)
        for s in steps2:
            all_steps.append({"phase": "Step 2: Hapus Unit Productions", **s})

        # Step 3: Remove useless symbols
        prods3, steps3 = remove_useless_symbols(prods2, start)
        for s in steps3:
            all_steps.append({"phase": "Step 3: Hapus Useless Symbols", **s})

        # Step 4: Convert to CNF
        prods4, steps4 = convert_to_cnf(prods3, start)
        for s in steps4:
            all_steps.append({"phase": "Step 4: Konversi ke CNF", **s})

        return {
            "original": original_text,
            "after_epsilon": grammar_to_text(prods1, start),
            "after_unit": grammar_to_text(prods2, start),
            "after_useless": grammar_to_text(prods3, start),
            "final_cnf": grammar_to_text(prods4, start),
            "start_symbol": start,
            "steps": all_steps,
            "error": None
        }

    except Exception as e:
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Chomsky Hierarchy Classification
# ---------------------------------------------------------------------------

def classify_chomsky_hierarchy(productions_text):
    """
    Classify a grammar according to the Chomsky Hierarchy.

    Type 3 (Regular): A → aB | a | ε  (right-linear)
    Type 2 (Context-Free): A → α  (LHS is single NT)
    Type 1 (Context-Sensitive): αAβ → αγβ  (|RHS| >= |LHS|)
    Type 0 (Unrestricted): any production

    Returns:
        dict: {type_num, type_name, description, details}
    """
    prods, start = grammar_to_dict(productions_text)
    nts = get_non_terminals(prods)

    is_type3 = True
    is_type2 = True
    is_type1 = True

    for lhs, rhs_list in prods.items():
        lhs_syms = lhs.split()

        # Check Type 2: LHS must be a single NT
        if len(lhs_syms) != 1 or lhs not in nts:
            is_type2 = False
            is_type3 = False

        for rhs in rhs_list:
            rhs_syms = rhs.split()

            # Check Type 1: |RHS| >= |LHS| (except ε-production for start)
            if len(rhs_syms) < len(lhs_syms):
                if not (rhs == "ε" and lhs == start):
                    is_type1 = False

            # Check Type 3: must be right-linear (A → a | A → aB)
            if is_type3:
                if rhs == "ε":
                    pass  # allowed
                elif len(rhs_syms) == 1:
                    if rhs_syms[0] in nts:
                        is_type3 = False  # Unit production — not right-linear
                elif len(rhs_syms) == 2:
                    if rhs_syms[0] in nts or rhs_syms[1] not in nts:
                        is_type3 = False  # Must be terminal + NT
                else:
                    is_type3 = False

    if is_type3 and is_type2:
        return {
            "type_num": 3,
            "type_name": "Regular Grammar",
            "description": "Semua produksi berbentuk A → a atau A → aB (right-linear). Dikenali oleh Finite Automata.",
            "properties": ["Dikenali oleh DFA/NFA", "Dapat dinyatakan sebagai Regular Expression", "Tertutup terhadap union, concatenation, Kleene star"]
        }
    elif is_type2:
        return {
            "type_num": 2,
            "type_name": "Context-Free Grammar (CFG)",
            "description": "Semua produksi berbentuk A → α (LHS berupa satu non-terminal). Dikenali oleh Pushdown Automata.",
            "properties": ["Dikenali oleh PDA", "Digunakan dalam parsing bahasa pemrograman", "Dapat dikonversi ke CNF"]
        }
    elif is_type1:
        return {
            "type_num": 1,
            "type_name": "Context-Sensitive Grammar (CSG)",
            "description": "Semua produksi αAβ → αγβ dengan |γ| ≥ 1. Dikenali oleh Linear Bounded Automata.",
            "properties": ["Dikenali oleh Linear Bounded Automata (LBA)", "Lebih ekspresif dari CFG", "Digunakan dalam sintaks alami"]
        }
    else:
        return {
            "type_num": 0,
            "type_name": "Unrestricted Grammar (Type 0)",
            "description": "Tidak ada batasan pada bentuk produksi. Dikenali oleh Mesin Turing.",
            "properties": ["Dikenali oleh Mesin Turing", "Paling ekspresif", "Masalah keanggotaan tidak dapat diputuskan (undecidable)"]
        }
