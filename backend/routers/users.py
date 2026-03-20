from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserRegister, UserLogin, Token, UserOut, UserUpdate
from auth import hash_password, verify_password, create_access_token, require_auth

from rate_limit import limiter, RATE_LIMITS

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut)
@limiter.limit(RATE_LIMITS["register"])
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
@limiter.limit(RATE_LIMITS["login"])
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(require_auth)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, current_user: User = Depends(require_auth), db: Session = Depends(get_db)):
    if data.name is not None:
        current_user.name = data.name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return current_user
