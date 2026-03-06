from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Product, Order, OrderStatus, UserRole
from schemas import AdminStats, UserOut, UserRoleUpdate, AdminUserUpdate
from auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar()
    total_products = db.query(func.count(Product.id)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).scalar()
    pending_orders = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PENDING).scalar()

    return AdminStats(
        total_users=total_users,
        total_products=total_products,
        total_orders=total_orders,
        total_revenue=round(float(total_revenue), 2),
        pending_orders=pending_orders,
    )


@router.get("/users", response_model=list[UserOut])
def get_all_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin endpoint to list all registered users."""
    users = db.query(User).order_by(User.id.desc()).all()
    return users


@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update user roles."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        user.role = UserRole(role_update.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role_update.role}")
    
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def admin_update_user(
    user_id: int,
    data: AdminUserUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin endpoint to edit a user's name, email, phone, and/or role."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        user.name = data.name
    if data.phone is not None:
        user.phone = data.phone
    if data.email is not None and data.email != user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use by another account")
        user.email = data.email
    if data.role is not None:
        try:
            user.role = UserRole(data.role)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {data.role}")

    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin endpoint to delete a user and all their associated data."""
    if admin.id == user_id:
        raise HTTPException(status_code=403, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return None
