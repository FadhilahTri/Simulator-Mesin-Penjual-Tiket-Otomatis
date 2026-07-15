"""
regex.py — Flask routes for Regular Expression endpoints.
"""
from flask import Blueprint, request, jsonify
from modules.regex_engine import (
    validate_with_python_regex,
    validate_all_fields,
    regex_to_nfa_visual,
    nfa_to_regular_grammar,
    SMARTTICKET_PATTERNS
)
from database.db import db, SimulationHistory
import json

regex_bp = Blueprint("regex", __name__, url_prefix="/api/regex")


@regex_bp.route("/patterns", methods=["GET"])
def get_patterns():
    """Return SmartTicket predefined regex patterns."""
    return jsonify(SMARTTICKET_PATTERNS)


@regex_bp.route("/validate", methods=["POST"])
def validate_regex():
    """
    Validate a string against a regex pattern.

    Request body:
        pattern (str): Regex pattern.
        test_string (str): String to test.
    """
    data = request.get_json()
    if not data or "pattern" not in data or "test_string" not in data:
        return jsonify({"error": "Missing 'pattern' or 'test_string'"}), 400

    result = validate_with_python_regex(data["pattern"], data["test_string"])

    history = SimulationHistory(
        modul="Regex",
        input=f"Pattern: {data['pattern']} | String: {data['test_string']}",
        output=json.dumps(result),
        status="Accepted" if result["matched"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)


@regex_bp.route("/validate-ticket", methods=["POST"])
def validate_ticket():
    """
    Validate all SmartTicket ticket fields.

    Request body:
        ticket_data (dict): {field_name: value}
    """
    data = request.get_json()
    if not data or "ticket_data" not in data:
        return jsonify({"error": "Missing 'ticket_data'"}), 400

    result = validate_all_fields(data["ticket_data"])
    all_matched = all(v["matched"] for v in result.values())

    history = SimulationHistory(
        modul="Regex-Ticket",
        input=json.dumps(data["ticket_data"]),
        output=json.dumps(result),
        status="Accepted" if all_matched else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({"results": result, "all_valid": all_matched})


@regex_bp.route("/to-nfa", methods=["POST"])
def regex_to_nfa():
    """
    Convert a regex pattern to an NFA visual graph.

    Request body:
        pattern (str): Regex pattern.
    """
    data = request.get_json()
    if not data or "pattern" not in data:
        return jsonify({"error": "Missing 'pattern'"}), 400

    nfa_graph = regex_to_nfa_visual(data["pattern"])
    grammar = nfa_to_regular_grammar(
        nfa_graph["nodes"],
        nfa_graph["edges"],
        nfa_graph["start"],
        nfa_graph["finals"]
    )

    history = SimulationHistory(
        modul="Regex-to-NFA",
        input=data["pattern"],
        output=json.dumps({"nodes": len(nfa_graph["nodes"]), "edges": len(nfa_graph["edges"])}),
        status="Success"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({"nfa": nfa_graph, "grammar": grammar})
