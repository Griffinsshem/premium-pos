from . import db
import bcrypt
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum("admin", "cashier"), default="cashier")

    # Relationship
    stock_adjustments = db.relationship(
        "StockAdjustment",
        backref="user",
        lazy=True
    )

    # 🔐 Hash password
    def set_password(self, password):
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        self.password_hash = hashed.decode("utf-8")

    # 🔐 Verify password
    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode("utf-8"),
            self.password_hash.encode("utf-8")
        )


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)

    sku = db.Column(db.String(100), unique=True, nullable=True)
    barcode = db.Column(db.String(100), unique=True, nullable=True)

    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

    is_deleted = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    stock_adjustments = db.relationship(
        "StockAdjustment",
        backref="product",
        lazy=True
    )

    # Relationship to sale items
    sale_items = db.relationship(
        "SaleItem",
        backref="product",
        lazy=True
    )


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)

    subtotal = db.Column(db.Float, nullable=False)
    tax = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0)
    total = db.Column(db.Float, nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    # Relationship
    items = db.relationship(
        "SaleItem",
        backref="sale",
        cascade="all, delete-orphan",
        lazy=True
    )


class SaleItem(db.Model):
    __tablename__ = "sale_items"

    id = db.Column(db.Integer, primary_key=True)

    sale_id = db.Column(
        db.Integer,
        db.ForeignKey("sales.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    qty = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)



class StockAdjustment(db.Model):
    __tablename__ = "stock_adjustments"

    id = db.Column(db.Integer, primary_key=True)

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    change = db.Column(db.Integer, nullable=False)  # +5 or -3
    reason = db.Column(db.String(255), nullable=False)

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )