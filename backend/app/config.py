class Config:
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://premium_user:StrongPassword123@localhost/premium_pos"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "super-secret-key"