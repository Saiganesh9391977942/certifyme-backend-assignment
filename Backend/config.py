import os

class Config:
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    # Using SQLite for local development, DATABASE_URL env var for production (PostgreSQL on Render)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.join(BASE_DIR, 'database.db'))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'certifyme-super-secret-jwt-key-2024')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'certifyme-flask-secret-key-2024')