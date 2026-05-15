from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Opportunity
from extensions import db

opp_bp = Blueprint('opportunities', __name__)

# Allowed fields for update (prevents overwriting id, admin_id, created_at)
ALLOWED_UPDATE_FIELDS = {'title', 'company', 'location', 'type', 'status', 'description'}

# ---------------- GET ALL ----------------
@opp_bp.route("/", methods=["GET"])
@jwt_required()
def get_all():
    user_id = int(get_jwt_identity())

    opps = Opportunity.query.filter_by(admin_id=user_id).all()

    data = []
    for o in opps:
        data.append(o.to_dict())

    return jsonify(data)


# ---------------- CREATE ----------------
@opp_bp.route("/", methods=["POST"])
@jwt_required()
def create():
    user_id = int(get_jwt_identity())
    data = request.json

    required_fields = ["title", "company", "location", "type", "status", "description"]

    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    new_opp = Opportunity(
        admin_id=user_id,
        title=data["title"],
        company=data["company"],
        location=data["location"],
        type=data["type"],
        status=data["status"],
        description=data["description"]
    )

    db.session.add(new_opp)
    db.session.commit()

    return jsonify({"message": "Created successfully", "id": new_opp.id}), 201


# ---------------- UPDATE ----------------
@opp_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update(id):
    user_id = int(get_jwt_identity())

    opp = Opportunity.query.get(id)

    if not opp or opp.admin_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.json

    for key in data:
        if key in ALLOWED_UPDATE_FIELDS:
            setattr(opp, key, data[key])

    db.session.commit()

    return jsonify({"message": "Updated successfully", "id": opp.id})


# ---------------- DELETE ----------------
@opp_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete(id):
    user_id = int(get_jwt_identity())

    opp = Opportunity.query.get(id)

    if not opp or opp.admin_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(opp)
    db.session.commit()

    return jsonify({"message": "Deleted successfully"})