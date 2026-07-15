"""
cfg.py — Flask routes for CFG / PDA simulation endpoints.
"""
from flask import Blueprint, request, jsonify
from modules.cfg_pda import (
    parse_cfg_text,
    leftmost_derivation,
    rightmost_derivation,
    build_parse_tree,
    simulate_pda,
    SMARTTICKET_CFG
)
from database.db import db, SimulationHistory
import json

cfg_bp = Blueprint("cfg", __name__, url_prefix="/api/cfg")


@cfg_bp.route("/default", methods=["GET"])
def get_default_cfg():
    """Return the pre-built SmartTicket CFG."""
    return jsonify(SMARTTICKET_CFG)


@cfg_bp.route("/simulate", methods=["POST"])
def simulate_cfg():
    """
    Simulate PDA on an input string using the provided CFG.

    Request body:
        grammar_text (str): CFG in text format.
        input_string (str): Terminal string to test.
    """
    data = request.get_json()
    if not data or "grammar_text" not in data or "input_string" not in data:
        return jsonify({"error": "Missing 'grammar_text' or 'input_string'"}), 400

    parsed = parse_cfg_text(data["grammar_text"])
    if parsed["error"]:
        return jsonify({"error": parsed["error"]}), 400

    result = simulate_pda(parsed["productions"], parsed["start_symbol"], data["input_string"])

    history = SimulationHistory(
        modul="PDA",
        input=data["input_string"],
        output=json.dumps({"steps": len(result["stack_trace"]), "accepted": result["accepted"]}),
        status="Accepted" if result["accepted"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({**result, "grammar": parsed})


@cfg_bp.route("/derive", methods=["POST"])
def derive():
    """
    Generate leftmost or rightmost derivation.

    Request body:
        grammar_text (str): CFG in text format.
        input_string (str): Target terminal string.
        type (str): "leftmost" | "rightmost"
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    parsed = parse_cfg_text(data.get("grammar_text", ""))
    if parsed["error"]:
        return jsonify({"error": parsed["error"]}), 400

    deriv_type = data.get("type", "leftmost")
    input_str = data.get("input_string", "")

    if deriv_type == "rightmost":
        result = rightmost_derivation(parsed["productions"], parsed["start_symbol"], input_str)
    else:
        result = leftmost_derivation(parsed["productions"], parsed["start_symbol"], input_str)

    history = SimulationHistory(
        modul=f"CFG-Derivation-{deriv_type}",
        input=input_str,
        output=json.dumps({"steps": result["steps"], "found": result["found"]}),
        status="Accepted" if result["found"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify({**result, "type": deriv_type})


@cfg_bp.route("/parse-tree", methods=["POST"])
def parse_tree():
    """
    Build a parse tree for the given input string.

    Request body:
        grammar_text (str): CFG in text format.
        input_string (str): String to parse.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON body"}), 400

    parsed = parse_cfg_text(data.get("grammar_text", ""))
    if parsed["error"]:
        return jsonify({"error": parsed["error"]}), 400

    result = build_parse_tree(parsed["productions"], parsed["start_symbol"], data.get("input_string", ""))

    history = SimulationHistory(
        modul="CFG-ParseTree",
        input=data.get("input_string", ""),
        output="Tree generated" if result["accepted"] else "No parse tree",
        status="Accepted" if result["accepted"] else "Rejected"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)
