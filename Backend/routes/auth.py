from flask import Blueprint, request, jsonify
from extensions import db, bcrypt
from models import Admin
from flask_jwt_extended import create_access_token
import secrets

auth_bp = Blueprint('auth', __name__)


# ───────────────────────────────────────────
# POST /api/auth/signup
# ───────────────────────────────────────────
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()

    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    if Admin.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    admin = Admin(name=name, email=email, password=hashed_pw)
    db.session.add(admin)
    db.session.commit()

    return jsonify({'message': 'Account created successfully'}), 201


# ───────────────────────────────────────────
# POST /api/auth/login
# ───────────────────────────────────────────
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    # data = request.get_json()

    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    admin = Admin.query.filter_by(email=email).first()

    if not admin or not bcrypt.check_password_hash(admin.password, password):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = create_access_token(identity=str(admin.id))

    return jsonify({
        'token': token,
        'admin': admin.to_dict()
    }), 200


# ───────────────────────────────────────────
# POST /api/auth/forgot-password
# ───────────────────────────────────────────
@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    admin = Admin.query.filter_by(email=email).first()

    # Always return success message (security best practice — don't leak if email exists)
    if admin:
        reset_token = secrets.token_urlsafe(32)
        # In production you'd email this link; here we just return it for dev testing
        reset_link = f'http://127.0.0.1:5500/reset-password?token={reset_token}&email={email}'
        print(f'[DEV] Password reset link for {email}: {reset_link}')

    return jsonify({'message': 'If that email exists, a reset link has been sent.'}), 200