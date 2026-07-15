"""
cnf.py — Flask routes for CNF Converter endpoints.
"""
from flask import Blueprint, request, jsonify
from modules.cnf_converter import full_cnf_conversion, classify_chomsky_hierarchy
from database.db import db, SimulationHistory
import json

cnf_bp = Blueprint("cnf", __name__, url_prefix="/api/cnf")


@cnf_bp.route("/convert", methods=["POST"])
def convert_cnf():
    """
    Run the full 4-step CNF conversion pipeline.

    Request body:
        grammar_text (str): CFG in text format.
    """
    data = request.get_json()
    if not data or "grammar_text" not in data:
        return jsonify({"error": "Missing 'grammar_text'"}), 400

    result = full_cnf_conversion(data["grammar_text"])

    if result.get("error"):
        return jsonify({"error": result["error"]}), 400

    history = SimulationHistory(
        modul="CNF",
        input=data["grammar_text"][:500],
        output=result.get("final_cnf", "")[:500],
        status="Success"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)


@cnf_bp.route("/classify", methods=["POST"])
def classify():
    """
    Classify a grammar according to the Chomsky Hierarchy.

    Request body:
        grammar_text (str): Grammar in text format.
    """
    data = request.get_json()
    if not data or "grammar_text" not in data:
        return jsonify({"error": "Missing 'grammar_text'"}), 400

    result = classify_chomsky_hierarchy(data["grammar_text"])

    history = SimulationHistory(
        modul="Chomsky-Classify",
        input=data["grammar_text"][:300],
        output=json.dumps({"type": result["type_num"], "name": result["type_name"]}),
        status="Success"
    )
    db.session.add(history)
    db.session.commit()

    return jsonify(result)
