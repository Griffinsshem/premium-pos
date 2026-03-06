from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import User, Product, StockAdjustment
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
# PRODUCT VALIDATION
# ==============================

def validate_product_data(data, is_update=False):
    errors = []

    if not data:
        errors.append("Request body is required")
        return errors

    if not is_update or "name" in data:
        name = data.get("name")
        if not name or not isinstance(name, str) or len(name.strip()) == 0:
            errors.append("Valid product name is required")
        elif len(name) > 100:
            errors.append("Product name cannot exceed 100 characters")

    if not is_update or "price" in data:
        price = data.get("price")
        try:
            price = float(price)
            if price <= 0:
                errors.append("Price must be greater than 0")
        except (TypeError, ValueError):
            errors.append("Price must be a valid number")

    if "stock" in data:
        try:
            stock = int(data.get("stock"))
            if stock < 0:
                errors.append("Stock cannot be negative")
        except (TypeError, ValueError):
            errors.append("Stock must be an integer")

    return errors


# ==============================
# PRODUCT ROUTES (WITH PAGINATION)
# ==============================

@main.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    data = request.get_json()

    errors = validate_product_data(data)
    if errors:
        return jsonify({"errors": errors}), 400

    product = Product(
    name=data["name"].strip(),
    description=data.get("description"),
    sku=data.get("sku"),
    barcode=data.get("barcode"),
    price=float(data["price"]),
    stock=int(data.get("stock", 0))
)

    db.session.add(product)
    db.session.commit()

    return jsonify({"message": "Product created successfully"}), 201


@main.route("/products", methods=["GET"])
@jwt_required()
def get_products():
    # Get pagination parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 5, type=int)

    # Get search query
    search = request.args.get("search", "", type=str)

    # Safety limits
    if page < 1:
        page = 1
    if per_page < 1:
        per_page = 5
    if per_page > 50:
        per_page = 50

    # Base query
    query = Product.query.filter_by(is_deleted=False)

    # Apply search if provided
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_pattern)) |
            (Product.sku.ilike(search_pattern)) |
            (Product.barcode.ilike(search_pattern))
        )

    # Order + paginate
    pagination = query.order_by(Product.created_at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    products = pagination.items

    return jsonify({
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "sku": p.sku,
                "barcode": p.barcode,
                "price": p.price,
                "stock": p.stock,
                "created_at": p.created_at,
                "updated_at": p.updated_at
            }
            for p in products
        ],
        "pagination": {
            "total_products": pagination.total,
            "total_pages": pagination.pages,
            "current_page": pagination.page,
            "per_page": pagination.per_page,
            "has_next": pagination.has_next,
            "has_prev": pagination.has_prev
        }
    })


@main.route("/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)

    if not product or product.is_deleted:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    errors = validate_product_data(data, is_update=True)
    if errors:
        return jsonify({"errors": errors}), 400

    if "name" in data:
        product.name = data["name"].strip()

    if "description" in data:
        product.description = data["description"]

    if "price" in data:
        product.price = float(data["price"])

    if "stock" in data:
        product.stock = int(data["stock"])

    db.session.commit()

    return jsonify({"message": "Product updated successfully"})


@main.route("/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)

    if not product or product.is_deleted:
        return jsonify({"error": "Product not found"}), 404

    product.is_deleted = True
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"})


# ==============================
# STOCK ADJUSTMENT ROUTES
# ==============================

@main.route("/stock_adjustments", methods=["POST"])
@jwt_required()
def adjust_stock():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Request body required"}), 400

    product_id = data.get("product_id")
    change = data.get("change")
    reason = data.get("reason")

    # Validate required fields
    if product_id is None or change is None or not reason:
        return jsonify({
            "error": "product_id, change, and reason are required"
        }), 400

    # Find product
    product = Product.query.get(product_id)

    if not product or product.is_deleted:
        return jsonify({"error": "Product not found"}), 404

    # Validate change value
    try:
        change = int(change)
    except (TypeError, ValueError):
        return jsonify({"error": "Change must be an integer"}), 400

    # Prevent stock from going below zero
    new_stock = product.stock + change
    if new_stock < 0:
        return jsonify({
            "error": "Stock adjustment failed. Stock cannot go below 0",
            "current_stock": product.stock
        }), 400

    # Get logged-in user
    current_user = get_jwt_identity()

    # Update stock
    product.stock = new_stock

    # Log adjustment
    adjustment = StockAdjustment(
        product_id=product.id,
        user_id=current_user["id"],
        change=change,
        reason=reason
    )

    db.session.add(adjustment)
    db.session.commit()

    return jsonify({
        "message": "Stock adjusted successfully",
        "product": {
            "id": product.id,
            "name": product.name,
            "new_stock": product.stock
        },
        "adjustment": {
            "change": change,
            "reason": reason,
            "adjusted_by": current_user["id"]
        }
    }), 200