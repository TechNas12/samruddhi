from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models import CartItem, Product, User
from schemas import CartItemCreate, CartItemUpdate, CartItemOut
from auth import require_auth

router = APIRouter(prefix="/api/cart", tags=["Cart"])


@router.get("", response_model=List[CartItemOut])
def get_cart(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    items = db.query(CartItem).options(
        joinedload(CartItem.product).joinedload(Product.category)
    ).filter(CartItem.user_id == user.id).all()
    return items


@router.post("", response_model=CartItemOut)
def add_to_cart(data: CartItemCreate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(CartItem).filter(
        CartItem.user_id == user.id,
        CartItem.product_id == data.product_id
    ).first()

    if existing:
        existing.quantity += data.quantity
        db.commit()
        db.refresh(existing)
        item = db.query(CartItem).options(
            joinedload(CartItem.product).joinedload(Product.category)
        ).filter(CartItem.id == existing.id).first()
        return item

    item = CartItem(user_id=user.id, product_id=data.product_id, quantity=data.quantity)
    db.add(item)
    db.commit()
    db.refresh(item)
    item = db.query(CartItem).options(
        joinedload(CartItem.product).joinedload(Product.category)
    ).filter(CartItem.id == item.id).first()
    return item


@router.put("/{item_id}", response_model=CartItemOut)
def update_cart_item(item_id: int, data: CartItemUpdate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if data.quantity <= 0:
        db.delete(item)
        db.commit()
        return {"detail": "Item removed"}
    item.quantity = data.quantity
    db.commit()
    db.refresh(item)
    item = db.query(CartItem).options(
        joinedload(CartItem.product).joinedload(Product.category)
    ).filter(CartItem.id == item.id).first()
    return item


@router.delete("/{item_id}")
def remove_from_cart(item_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"detail": "Item removed from cart"}


@router.delete("")
def clear_cart(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()
    db.commit()
    return {"detail": "Cart cleared"}
