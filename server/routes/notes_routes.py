from flask import request, Blueprint, g
from services.notes_service import NotesService
from repositories.notes_repository import SupabaseNotesRepository, DEFAULT_FONT_SIZE_PX

note_bp = Blueprint("/api/notes", __name__)

# Initialize repository and service
note_repository = SupabaseNotesRepository()
notes_service = NotesService(note_repository)


@note_bp.route("/getAll", methods=["GET"])
def get_notes():
    notes = notes_service.get_notes_by_user_id(g.user.id)
    return {"status": "ok", "notes": [note.to_dict() for note in notes]}, 200


@note_bp.route("/get/<note_id>", methods=["GET"])
def get_note(note_id):
    note = notes_service.get_note_by_id(note_id, g.user.id)
    return {"status": "ok", "note": note.to_dict()}, 200


@note_bp.route("/create", methods=["POST"])
def create_note():
    data = request.get_json()

    title = data.get("title", "")
    content = data.get("content", "")
    font_size_px = data.get("font_size_px", DEFAULT_FONT_SIZE_PX)

    note = notes_service.create_note(
        user_id=g.user.id,
        title=title,
        content=content,
        font_size_px=font_size_px,
    )

    return {"status": "ok", "note": note.to_dict()}, 201


@note_bp.route("/update/<note_id>", methods=["PUT"])
def update_note(note_id):
    data = request.get_json()

    title = data.get("title", "")
    content = data.get("content", "")
    font_size_px = data.get("font_size_px", DEFAULT_FONT_SIZE_PX)

    notes_service.update_note(
        note_id=note_id,
        user_id=g.user.id,
        title=title,
        content=content,
        font_size_px=font_size_px,
    )

    return {"status": "ok"}, 200


@note_bp.route("/versions/<note_id>", methods=["GET"])
def list_note_versions(note_id):
    versions = notes_service.list_note_versions(note_id, g.user.id)
    return {"status": "ok", "versions": versions}, 200


@note_bp.route("/version/<note_id>/<version_id>", methods=["GET"])
def get_note_version(note_id, version_id):
    version = notes_service.get_note_version(note_id, version_id, g.user.id)
    return {"status": "ok", "version": version}, 200


@note_bp.route("/restore/<note_id>/<version_id>", methods=["POST"])
def restore_note_version(note_id, version_id):
    note = notes_service.restore_note_version(note_id, version_id, g.user.id)
    return {"status": "ok", "note": note.to_dict()}, 200
