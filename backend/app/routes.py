from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import User, Product
from . import db

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return jsonify({"message": "Premium POS Backend Running"})


# ==============================
# USER ROUTES
# ==============================

@main.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([
        {"id": u.id, "name": u.name, "email": u.email}
        for u in users
    ])


@main.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(
        name=data["name"],
        email=data["email"],
        role=data.get("role", "cashier")
    )

    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@main.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    if data.get("name"):
        user.name = data["name"]

    if data.get("email"):
        existing_user = User.query.filter_by(email=data["email"]).first()
        if existing_user and existing_user.id != user.id:
            return jsonify({"error": "Email already exists"}), 400
        user.email = data["email"]

    if data.get("role"):
        user.role = data["role"]

    db.session.commit()

    return jsonify({"message": "User updated successfully"})


@main.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"})


# ==============================
# AUTH ROUTES
# ==============================

@main.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data or not data.get("name") or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing required fields"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"error": "Email already exists"}), 400

    new_user = User(
        name=data["name"],
        email=data["email"],
        role=data.get("role", "cashier")
    )

    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@main.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity={
        "id": user.id,
        "email": user.email,
        "role": user.role
    })

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }), 200


@main.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()

    return jsonify({
        "message": "Access granted",
        "current_user": current_user
    }), 200


# ==============================
# PRODUCT ROUTES (STEP 2)
# ==============================

# 🔹 CREATE PRODUCT
@main.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    data = request.get_json()

    if not data or not data.get("name") or data.get("price") is None:
        return jsonify({"error": "Name and price are required"}), 400

    product = Product(
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        stock=data.get("stock", 0)
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Product created successfully"}), 201


# 🔹 GET PRODUCTS (non-deleted only)
@main.route("/products", methods=["GET"])
@jwt_required()
def get_products():
    products = Product.query.filter_by(is_deleted=False).all()

    return jsonify([
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "stock": p.stock,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        }
        for p in products
    ])


# 🔹 UPDATE PRODUCT
@main.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)

    if not product or product.is_deleted:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    if data.get("name"):
        product.name = data["name"]

    if data.get("description") is not None:
        product.description = data["description"]

    if data.get("price") is not None:
        product.price = data["price"]

    if data.get("stock") is not None:
        product.stock = data["stock"]

    db.session.commit()

    return jsonify({"message": "Product updated successfully"})


# 🔹 SOFT DELETE PRODUCT
@main.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)

    if not product or product.is_deleted:
        return jsonify({"error": "Product not found"}), 404

    product.is_deleted = True
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"})