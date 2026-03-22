from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import User, Product, StockAdjustment, Sale, SaleItem, Payment
import requests
import base64
from datetime import datetime, timedelta
from flask import current_app
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
# PRODUCT ROUTES
# ==============================

@main.route("/products", methods=["POST"])
@jwt_required()
def create_product():
    data = request.get_json()

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
def get_products():

    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 5, type=int)
    search = request.args.get("search", "", type=str)

    query = Product.query

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_pattern)) |
            (Product.sku.ilike(search_pattern)) |
            (Product.barcode.ilike(search_pattern))
        )

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


# ==============================
# STOCK ADJUSTMENT ROUTES
# ==============================

@main.route("/stock_adjustments", methods=["POST"])
@jwt_required()
def adjust_stock():
    data = request.get_json()

    product = Product.query.get(data["product_id"])
    current_user = get_jwt_identity()

    product.stock += data["change"]

    adjustment = StockAdjustment(
        product_id=product.id,
        user_id=current_user["id"],
        change=data["change"],
        reason=data["reason"]
    )

    db.session.add(adjustment)
    db.session.commit()

    return jsonify({"message": "Stock adjusted successfully"})


# ==============================
# SALES ROUTES
# ==============================

@main.route("/sales", methods=["POST"])
@jwt_required()
def create_sale():

    try:

        current_user = get_jwt_identity()

        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body required"}), 400

        items = data.get("items")
        subtotal = data.get("subtotal")
        tax = data.get("tax")
        discount = data.get("discount")
        total = data.get("total")

        if not items or total is None:
            return jsonify({
                "error": "items and total are required"
            }), 400

        sale = Sale(
            user_id=current_user["id"],
            subtotal=subtotal,
            tax=tax,
            discount=discount,
            total=total
        )

        db.session.add(sale)
        db.session.flush()

        for item in items:

            product = Product.query.get(item["product_id"])

            if not product:
                raise Exception(f"Product {item['product_id']} not found")

            if product.stock < item["qty"]:
                raise Exception(f"Insufficient stock for {product.name}")

            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=item["product_id"],
                qty=item["qty"],
                price=item["price"]
            )

            product.stock -= item["qty"]

            adjustment = StockAdjustment(
                product_id=product.id,
                user_id=current_user["id"],
                change=-item["qty"],
                reason="sale"
            )

            db.session.add(sale_item)
            db.session.add(adjustment)

        db.session.commit()

        return jsonify({
            "message": "Sale completed successfully",
            "sale_id": sale.id
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": "Sale failed",
            "details": str(e)
        }), 400
    

# ==============================
# PAYMENT ROUTES
# ==============================

@main.route("/payments", methods=["POST"])
@jwt_required()
def create_payment():

    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body required"}), 400

        sale_id = data.get("sale_id")
        amount_paid = data.get("amount_paid")
        payment_method = data.get("payment_method", "cash")

        # Validate inputs
        if not sale_id or amount_paid is None:
            return jsonify({
                "error": "sale_id and amount_paid are required"
            }), 400

        sale = Sale.query.get(sale_id)

        if not sale:
            return jsonify({"error": "Sale not found"}), 404

        if sale.status == "paid":
            return jsonify({"error": "Sale already paid"}), 400

        # Calculate balance
        balance = amount_paid - sale.total

        if balance < 0:
            return jsonify({
                "error": "Insufficient payment",
                "required": sale.total,
                "paid": amount_paid
            }), 400

        # Create payment record
        payment = Payment(
            sale_id=sale.id,
            amount_paid=amount_paid,
            balance=balance,
            payment_method=payment_method
        )

        # Mark sale as paid
        sale.status = "paid"

        db.session.add(payment)
        db.session.commit()

        return jsonify({
            "message": "Payment successful",
            "payment": {
                "sale_id": sale.id,
                "total": sale.total,
                "paid": amount_paid,
                "balance": balance,
                "method": payment_method
            }
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "error": "Payment failed",
            "details": str(e)
        }), 400
    
# ==============================
# M-PESA (DARAJA) HELPERS
# ==============================

def get_mpesa_access_token():
    consumer_key = current_app.config["MPESA_CONSUMER_KEY"]
    consumer_secret = current_app.config["MPESA_CONSUMER_SECRET"]
    base_url = current_app.config["MPESA_BASE_URL"]

    url = f"{base_url}/oauth/v1/generate?grant_type=client_credentials"

    response = requests.get(url, auth=(consumer_key, consumer_secret))

    if response.status_code != 200:
        raise Exception("Failed to get access token")

    return response.json().get("access_token")


def generate_password():
    shortcode = current_app.config["MPESA_SHORTCODE"]
    passkey = current_app.config["MPESA_PASSKEY"]

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    data_to_encode = shortcode + passkey + timestamp

    encoded = base64.b64encode(data_to_encode.encode()).decode()

    return encoded, timestamp


def stk_push(phone_number, amount, account_reference="PremiumPOS", description="Payment"):
    access_token = get_mpesa_access_token()

    password, timestamp = generate_password()

    base_url = current_app.config["MPESA_BASE_URL"]
    url = f"{base_url}/mpesa/stkpush/v1/processrequest"

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "BusinessShortCode": current_app.config["MPESA_SHORTCODE"],
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number,
        "PartyB": current_app.config["MPESA_SHORTCODE"],
        "PhoneNumber": phone_number,
        "CallBackURL": current_app.config["MPESA_CALLBACK_URL"],
        "AccountReference": account_reference,
        "TransactionDesc": description
    }

    response = requests.post(url, json=payload, headers=headers)

    return response.json()


# ==============================
# STK PUSH ENDPOINT
# ==============================

@main.route("/mpesa/stk", methods=["POST"])
@jwt_required()
def mpesa_stk():

    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body required"}), 400

        sale_id = data.get("sale_id")
        phone = data.get("phone")

        if not sale_id or not phone:
            return jsonify({
                "error": "sale_id and phone are required"
            }), 400

        # Normalize phone number (07XXXXXXXX → 2547XXXXXXXX)
        if phone.startswith("0"):
            phone = "254" + phone[1:]

        sale = Sale.query.get(sale_id)

        if not sale:
            return jsonify({"error": "Sale not found"}), 404

        if sale.status == "paid":
            return jsonify({"error": "Sale already paid"}), 400

        # Create pending payment
        payment = Payment(
            sale_id=sale.id,
            amount_paid=0,
            balance=sale.total,
            payment_method="mpesa",
            status="pending",
            phone_number=phone
        )

        db.session.add(payment)
        db.session.commit()

        # Trigger STK Push
        mpesa_response = stk_push(phone, sale.total)

        return jsonify({
            "message": "STK push sent to phone",
            "sale_id": sale.id,
            "phone": phone,
            "mpesa_response": mpesa_response
        }), 200

    except Exception as e:
        return jsonify({
            "error": "STK push failed",
            "details": str(e)
        }), 400
    

# ==============================
# DASHBOARD METRICS
# ==============================

@main.route("/dashboard/metrics", methods=["GET"])
@jwt_required()
def dashboard_metrics():
    try:
        now = datetime.utcnow()

        # Start of today (00:00)
        start_of_today = datetime(now.year, now.month, now.day)

        # Start of week (Monday)
        start_of_week = start_of_today - timedelta(days=start_of_today.weekday())

        # -------------------------
        # TODAY SALES
        # -------------------------
        today_sales = db.session.query(
            db.func.coalesce(db.func.sum(Sale.total), 0)
        ).filter(
            Sale.created_at >= start_of_today,
            Sale.status == "paid"
        ).scalar()

        # -------------------------
        # WEEKLY SALES
        # -------------------------
        weekly_sales = db.session.query(
            db.func.coalesce(db.func.sum(Sale.total), 0)
        ).filter(
            Sale.created_at >= start_of_week,
            Sale.status == "paid"
        ).scalar()

        # -------------------------
        # TRANSACTION COUNT
        # -------------------------
        transaction_count = db.session.query(
            db.func.count(Sale.id)
        ).filter(
            Sale.created_at >= start_of_today
        ).scalar()

        return jsonify({
            "today_sales": float(today_sales),
            "weekly_sales": float(weekly_sales),
            "transactions_today": transaction_count
        }), 200

    except Exception as e:
        return jsonify({
            "error": "Failed to fetch metrics",
            "details": str(e)
        }), 500