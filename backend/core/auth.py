import os
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta

current_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(current_dir, "../../users.db"))
SECRET_KEY = os.getenv("JWT_SECRET", "stratos_super_secret_session_key_2026")
ALGORITHM = "HS256"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_auth_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            team TEXT,
            level TEXT,
            language TEXT
        )
    """)
    conn.commit()
    conn.close()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(username: str, expires_delta: timedelta = timedelta(days=7)) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {
        "sub": username,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except jwt.PyJWTError:
        return None
