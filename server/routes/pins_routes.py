from flask import request, Blueprint, g
from services.pins_service import PinsService
from repositories.pins_repository import SupabasePinsRepository


pins_bp = Blueprint("/api/pins", __name__)

# Initialize repository and service
pin_repository = SupabasePinsRepository()
pins_service = PinsService(pin_repository)

@pins_bp.route("/getAll", methods=["GET"])
def get_pins():

    try:
        user_id = g.user.id

        pins = pins_service.get_pins_by_user_id(user_id)

        return {
            "status": "ok",
            "pins": [pin.to_dict() for pin in pins]
        }, 200

    except Exception as e:
        print(e)
        return {"message": str(e)}, 500

@pins_bp.route("/create", methods=["POST"])
def create_pin():

    try:
        user_id = g.user.id

        data = request.get_json()

        url = data.get("url")
        #source_type = data.get("source_type")
        # add support for other source types in the future

        if not url:
            return {"message": "Missing URL"}, 400

        pin = pins_service.create_pin(
            user_id=user_id,
            url=url
        )

        return {
            "status": "ok",
            "pin": pin.to_dict()
        }, 201

    except Exception as e:
        print(e)
        return {"message": str(e)}, 500