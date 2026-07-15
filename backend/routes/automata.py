"""
automata.py — Flask routes for DFA/NFA simulation endpoints.
"""
from flask import Blueprint, request, jsonify
from modules.dfa_nfa import simulate_dfa, simulate_nfa, nfa_to_dfa, get_smartticket_dfa
from database.db import db, SimulationHistory
import json

automata_bp = Blueprint("automata", __name__, url_prefix="/api/automata")


@automata_bp.route("/default", methods=["GET"])
def get_default_dfa():
    """Return the pre-built SmartTicket DFA definition."""
    return jsonify(get_smartticket_dfa())


@automata_bp.route("/simulate-dfa", methods=["POST"])
def simulate_dfa_route():
    """
    Simulate a DFA on the given input string.

    Request body:
        states (list), alphabet (list), transitions (dict),
        start_state (str), final_states (list), input_string (str)
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    required = ["states", "alphabet", "transitions", "start_state", "final_states", "input_string"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    result = simulate_dfa(
        states=data["states"],
        alphabet=data["alphabet"],
        transitions=data["transitions"],
        start_state=data["start_state"],
        final_states=data["final_states"],
        input_string=data["input_string"]
    )

    # Save to history
    history = SimulationHistory(
        modul="DFA",
        input=data["input_string"],
        output=json.dumps(result["trace"]),
        status="Accepted" if result["accepted"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)


@automata_bp.route("/simulate-nfa", methods=["POST"])
def simulate_nfa_route():
    """
    Simulate an NFA on the given input string.

    Request body:
        states (list), alphabet (list), transitions (dict with lists as values),
        start_state (str), final_states (list), input_string (str)
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    required = ["states", "alphabet", "transitions", "start_state", "final_states", "input_string"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    result = simulate_nfa(
        states=data["states"],
        alphabet=data["alphabet"],
        transitions=data["transitions"],
        start_state=data["start_state"],
        final_states=data["final_states"],
        input_string=data["input_string"]
    )

    history = SimulationHistory(
        modul="NFA",
        input=data["input_string"],
        output=json.dumps(result.get("trace", [])),
        status="Accepted" if result["accepted"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)


@automata_bp.route("/nfa-to-dfa", methods=["POST"])
def nfa_to_dfa_route():
    """
    Convert NFA to DFA using Subset Construction.

    Request body:
        states (list), alphabet (list), transitions (dict),
        start_state (str), final_states (list)
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body provided"}), 400

    required = ["states", "alphabet", "transitions", "start_state", "final_states"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    result = nfa_to_dfa(
        states=data["states"],
        alphabet=data["alphabet"],
        nfa_transitions=data["transitions"],
        start_state=data["start_state"],
        nfa_final_states=data["final_states"]
    )

    history = SimulationHistory(
        modul="NFA-to-DFA",
        input=json.dumps({"states": data["states"], "start": data["start_state"]}),
        output=json.dumps({"dfa_states": result["dfa_states"], "dfa_finals": result["dfa_finals"]}),
        status="Success"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)
