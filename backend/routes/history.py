"""
history.py — Flask routes for Simulation History endpoints.
"""
from flask import Blueprint, request, jsonify
from database.db import db, SimulationHistory

history_bp = Blueprint("history", __name__, url_prefix="/api/history")


@history_bp.route("/", methods=["GET"])
def get_history():
    """
    Retrieve simulation history with optional filtering and pagination.

    Query params:
        module (str): Filter by module name (optional).
        status (str): Filter by status (optional).
        search (str): Search in input field (optional).
        page (int): Page number (default 1).
        per_page (int): Items per page (default 15).
        limit (int): Legacy — max results if page not given (default 100).
    """
    module_filter = request.args.get("module")
    status_filter = request.args.get("status")
    search = request.args.get("search")
    page = request.args.get("page", type=int)
    per_page = request.args.get("per_page", 15, type=int)
    limit = request.args.get("limit", 100, type=int)

    query = SimulationHistory.query.order_by(SimulationHistory.tanggal.desc())

    if module_filter:
        query = query.filter(SimulationHistory.modul.ilike(f"%{module_filter}%"))
    if status_filter:
        query = query.filter(SimulationHistory.status == status_filter)
    if search:
        query = query.filter(SimulationHistory.input.ilike(f"%{search}%"))

    # Pagination mode
    if page is not None:
        total = query.count()
        records = query.offset((page - 1) * per_page).limit(per_page).all()
        return jsonify({
            "items": [r.to_dict() for r in records],
            "total": total,
            "page": page,
            "per_page": per_page,
        })

    # Legacy mode (limit only)
    records = query.limit(limit).all()
    return jsonify([r.to_dict() for r in records])


@history_bp.route("/<int:record_id>", methods=["DELETE"])
def delete_history(record_id):
    """Delete a single history record by ID."""
    record = SimulationHistory.query.get(record_id)
    if not record:
        return jsonify({"error": "Record not found"}), 404

    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": f"Record {record_id} deleted successfully"})


@history_bp.route("/clear", methods=["DELETE"])
def clear_history():
    """Delete all history records."""
    count = SimulationHistory.query.count()
    SimulationHistory.query.delete()
    db.session.commit()
    return jsonify({"message": f"{count} records deleted"})


@history_bp.route("/stats", methods=["GET"])
def get_stats():
    """Return summary statistics for the history."""
    total = SimulationHistory.query.count()
    accepted = SimulationHistory.query.filter_by(status="Accepted").count()
    rejected = SimulationHistory.query.filter_by(status="Rejected").count()
    success = SimulationHistory.query.filter_by(status="Success").count()

    # Module breakdown
    modules = db.session.query(
        SimulationHistory.modul,
        db.func.count(SimulationHistory.id)
    ).group_by(SimulationHistory.modul).all()

    return jsonify({
        "total": total,
        "accepted": accepted,
        "rejected": rejected,
        "success": success,
        "by_module": {m: c for m, c in modules}
    })
