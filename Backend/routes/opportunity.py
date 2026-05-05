from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Opportunity
from extensions import db

opp_bp = Blueprint('opportunities', __name__)

# ---------------- GET ALL ----------------
@opp_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    user_id = get_jwt_identity()

    opps = Opportunity.query.filter_by(admin_id=user_id).all()

    data = []
    for o in opps:
        data.append({
            "id": o.id,
            "name": o.name,
            "category": o.category,
            "duration": o.duration,
            "start_date": o.start_date,
            "description": o.description
        })

    return jsonify(data)


# ---------------- CREATE ----------------
@opp_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    user_id = get_jwt_identity()
    data = request.json

    required_fields = ["name", "duration", "start_date", "description",
                       "skills", "category", "future_opportunities"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    new_opp = Opportunity(
        admin_id=user_id,
        name=data["name"],
        duration=data["duration"],
        start_date=data["start_date"],
        description=data["description"],
        skills=data["skills"],
        category=data["category"],
        future_opportunities=data["future_opportunities"],
        max_applicants=data.get("max_applicants")
    )

    db.session.add(new_opp)
    db.session.commit()

    return jsonify({"message": "Created successfully"})


# ---------------- UPDATE ----------------
@opp_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    user_id = get_jwt_identity()

    opp = Opportunity.query.get(id)

    if not opp or opp.admin_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    for key in data:
        setattr(opp, key, data[key])

    db.session.commit()

    return jsonify({"message": "Updated successfully"})


# ---------------- DELETE ----------------
@opp_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    user_id = get_jwt_identity()

    opp = Opportunity.query.get(id)

    if not opp or opp.admin_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(opp)
    db.session.commit()

    return jsonify({"message": "Deleted successfully"})