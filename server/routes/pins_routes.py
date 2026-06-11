from flask import request, Blueprint, g
from services.pins_service import PinsService
from repositories.pins_repository import SupabasePinsRepository
from exceptions import ValidationError

pins_bp = Blueprint("/api/pins", __name__)

# Initialize repository and service
pin_repository = SupabasePinsRepository()
pins_service = PinsService(pin_repository)


@pins_bp.route("/getAll", methods=["GET"])
def get_pins():
    pins = pins_service.get_pins_by_user_id(g.user.id)
    return {
        "status": "ok",
        "pins": [pin.to_dict() for pin in pins],
    }, 200


@pins_bp.route("/create", methods=["POST"])
def create_pin():
    data = request.get_json()

    url = data.get("url")

    if not url:
        raise ValidationError("URL is required")

    pin = pins_service.create_pin(
        user_id=g.user.id,
        url=url,
    )

    return {
        "status": "ok",
        "pin": pin.to_dict(),
    }, 201
