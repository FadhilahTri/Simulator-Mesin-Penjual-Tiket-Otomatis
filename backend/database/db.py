"""
db.py — SQLite database setup and models for SmartTicket.
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class SimulationHistory(db.Model):
    """Model for storing simulation history across all modules."""
    __tablename__ = "history"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tanggal = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    modul = db.Column(db.String(50), nullable=False)   # e.g. "DFA", "NFA", "Regex", "CFG", "CNF"
    input = db.Column(db.Text, nullable=False)
    output = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # "Accepted" | "Rejected" | "Success"

    def to_dict(self):
        import json
        # Try to parse output as JSON for the detail field
        try:
            detail = json.loads(self.output)
        except Exception:
            detail = self.output

        # Normalize status → result key expected by frontend
        status_lower = (self.status or "").lower()
        if status_lower == "accepted":
            result = "accepted"
        elif status_lower == "rejected":
            result = "rejected"
        else:
            result = "error"

        return {
            "id": self.id,
            # Original fields
            "tanggal": self.tanggal.strftime("%Y-%m-%d %H:%M:%S"),
            "modul": self.modul,
            "input": self.input,
            "output": self.output,
            "status": self.status,
            # Alias fields for frontend compatibility
            "module": self.modul.lower().replace("-", "_"),
            "result": result,
            "created_at": self.tanggal.isoformat(),
            "detail": detail,
        }


def init_db(app):
    """Initialize the database with the Flask app context."""
    db.init_app(app)
    with app.app_context():
        db.create_all()
