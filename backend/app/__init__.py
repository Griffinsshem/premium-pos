from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Database config
    db.init_app(app)

    # JWT Configuration
    app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"

    jwt.init_app(app)

    from .routes import main
    app.register_blueprint(main)

    return app