"""
Authentication routes for MoneyMentor
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import hashlib
import logging

router = APIRouter()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None

# Mock user database (in production, use a real database)
users_db = {}
user_id_counter = 1

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/auth/signup")
async def signup(user: UserCreate):
    """
    Register a new user
    """
    global user_id_counter
    
    logger.info(f"Signup attempt for email: {user.email}")
    
    # Check if user already exists
    if user.email in users_db:
        logger.warning(f"User already exists: {user.email}")
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Validate input
    if not user.password or len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
    
    # Create new user
    new_user = {
        "id": user_id_counter,
        "email": user.email,
        "password": hash_password(user.password),  # Hash the password
        "name": user.name
    }
    
    users_db[user.email] = new_user
    user_id_counter += 1
    
    logger.info(f"User created successfully: {user.email}")
    
    return {
        "message": "User created successfully",
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "name": new_user["name"]
        }
    }

@router.post("/auth/login")
async def login(user: UserLogin):
    """
    Authenticate user
    """
    logger.info(f"Login attempt for email: {user.email}")
    
    # Check if user exists
    if user.email not in users_db:
        logger.warning(f"Login failed - user not found: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    stored_user = users_db[user.email]
    
    # Check password (compare hashed passwords)
    hashed_input_password = hash_password(user.password)
    if stored_user["password"] != hashed_input_password:
        logger.warning(f"Login failed - invalid password for: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    logger.info(f"Login successful for: {user.email}")
    
    return {
        "message": "Login successful",
        "user": {
            "id": stored_user["id"],
            "email": stored_user["email"],
            "name": stored_user["name"]
        },
        "token": f"mock-token-{stored_user['id']}-{hash(user.email)[:10]}"  # Simple mock token
    }

@router.post("/auth/logout")
async def logout():
    """
    Logout user (clear session/token)
    """
    logger.info("User logout")
    return {"message": "Logout successful"}

@router.get("/auth/me")
async def get_current_user():
    """
    Get current user profile (placeholder - would need authentication middleware)
    """
    return {
        "message": "This endpoint requires authentication middleware",
        "user": None
    }
