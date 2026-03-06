from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models import WishlistItem, Product, User
from schemas import WishlistItemCreate, WishlistItemOut
from auth import require_auth

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])


@router.get("", response_model=List[WishlistItemOut])
def get_wishlist(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    items = db.query(WishlistItem).options(
        joinedload(WishlistItem.product).joinedload(Product.category)
    ).filter(WishlistItem.user_id == user.id).all()
    return items


@router.post("", response_model=WishlistItemOut)
def add_to_wishlist(data: WishlistItemCreate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(WishlistItem).filter(
        WishlistItem.user_id == user.id,
        WishlistItem.product_id == data.product_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already in wishlist")

    item = WishlistItem(user_id=user.id, product_id=data.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = db.query(WishlistItem).options(
        joinedload(WishlistItem.product).joinedload(Product.category)
    ).filter(WishlistItem.id == item.id).first()
    return item


@router.delete("/{item_id}")
def remove_from_wishlist(item_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    item = db.query(WishlistItem).filter(WishlistItem.id == item_id, WishlistItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Removed from wishlist"}
