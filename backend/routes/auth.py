from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from passlib.context import CryptContext
import jwt
import datetime

router = APIRouter()

SECRET_KEY = "super-secret-celestial-key"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory mock database
users_db = {}

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup")
async def signup(user: UserSignup):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    users_db[user.email] = {
        "name": user.name,
        "password": hashed_password
    }
    
    token = create_access_token({"sub": user.email, "name": user.name})
    return {"message": "User created successfully", "token": token, "name": user.name, "email": user.email}

@router.post("/login")
async def login(user: UserLogin):
    if user.email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_info = users_db[user.email]
    if not pwd_context.verify(user.password, user_info["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token({"sub": user.email, "name": user_info["name"]})
    return {"message": "Login successful", "token": token, "name": user_info["name"], "email": user.email}
