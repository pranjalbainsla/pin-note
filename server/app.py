from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.notes_routes import note_bp
from routes.pins_routes import pins_bp
from middleware.auth import auth_middleware
from exceptions import AppError

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
)
app.before_request(auth_middleware)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(note_bp, url_prefix="/api/notes")
app.register_blueprint(pins_bp, url_prefix="/api/pins")

# register global error handlers
@app.errorhandler(AppError)
def handle_app_error(e: AppError):
    return {"status": "error", "message": str(e)}, e.status_code
@app.errorhandler(Exception)
def handle_unexpected_error(e: Exception):
    app.logger.exception(e)
    return {"status": "error", "message": "Something went wrong"}, 500

if __name__ == "__main__":
    app.run(debug=True)