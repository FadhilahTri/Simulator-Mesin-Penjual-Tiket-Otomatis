"""
app.py — Main Flask application entry point for SmartTicket backend.
Serves both the REST API and the built React frontend from one process.
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from database.db import init_db
from routes.automata import automata_bp
from routes.regex import regex_bp
from routes.cfg import cfg_bp
from routes.cnf import cnf_bp
from routes.history import history_bp

# Path ke folder dist hasil build frontend
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")


def create_app():
    """Application factory — creates and configures the Flask app."""
    app = Flask(
        __name__,
        static_folder=FRONTEND_DIST,
        static_url_path="",
    )
    app.config.from_object(Config)

    # Enable CORS for all origins (development)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(automata_bp)
    app.register_blueprint(regex_bp)
    app.register_blueprint(cfg_bp)
    app.register_blueprint(cnf_bp)
    app.register_blueprint(history_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            "status": "ok",
            "message": "SmartTicket API is running",
            "version": "1.0.0"
        })

    # ── Serve React frontend ──────────────────────────────────────────────
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        """Serve the built React SPA. Falls back to index.html for client-side routing."""
        target = os.path.join(FRONTEND_DIST, path)
        if path and os.path.exists(target):
            return send_from_directory(FRONTEND_DIST, path)
        return send_from_directory(FRONTEND_DIST, "index.html")

    @app.errorhandler(404)
    def not_found(e):
        # For API routes return JSON; for others serve the SPA
        return send_from_directory(FRONTEND_DIST, "index.html")

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n" + "=" * 50)
    print("  SmartTicket berjalan di http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(debug=True, port=5000, host="0.0.0.0")
