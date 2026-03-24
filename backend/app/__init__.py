from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Database config
    db.init_app(app)

    # JWT Configuration
    app.config["JWT_SECRET_KEY"] = "super-secret-key-change-this"

    jwt.init_app(app)

    migrate.init_app(app, db)

    CORS(app,
         supports_credentials=True,
         resources={r"/*": {"origins": "http://localhost:3000"}})

    from .routes import main
    app.register_blueprint(main)

    return app