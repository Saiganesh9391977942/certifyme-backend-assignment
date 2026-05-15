from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db, bcrypt, jwt
from routes.auth import auth_bp
from routes.opportunity import opp_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ── Extensions ──────────────────────────
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # ── CORS (allow frontend origins) ───
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Blueprints ──────────────────────────
    app.register_blueprint(auth_bp,  url_prefix='/api/auth')
    app.register_blueprint(opp_bp,   url_prefix='/api/opportunities')

    # ── Create tables on first run ───────────
    with app.app_context():
        db.create_all()
       

    return app


# For local development: python app.py
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)

# For production (gunicorn): gunicorn "app:create_app()"
# Gunicorn uses the create_app() factory directly via the Procfile