from extensions import db
from datetime import datetime

class Admin(db.Model):
    __tablename__ = 'admin'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    opportunities = db.relationship('Opportunity', backref='admin', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Opportunity(db.Model):
    __tablename__ = 'opportunity'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(100), nullable=False)      # e.g. Full-time, Part-time
    status = db.Column(db.String(100), nullable=False)    # e.g. Open, Closed
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'type': self.type,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'admin_id': self.admin_id
        }