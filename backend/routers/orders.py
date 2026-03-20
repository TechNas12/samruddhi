from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models import Order, OrderItem, CartItem, Product, Address, User, OrderStatus
from schemas import OrderCreate, OrderOut, OrderStatusUpdate
from auth import require_auth, require_admin
from utils.email import send_order_emails

from rate_limit import limiter, RATE_LIMITS

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=List[OrderOut])
def list_orders(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address)
    )
    if user.role.value != "admin":
        query = query.filter(Order.user_id == user.id)
    return query.order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address)
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return order


@router.post("", response_model=OrderOut)
@limiter.limit(RATE_LIMITS["order"])
def create_order(request: Request, data: OrderCreate, background_tasks: BackgroundTasks, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    address = db.query(Address).filter(Address.id == data.address_id, Address.user_id == user.id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Get cart items
    cart_items = db.query(CartItem).options(
        joinedload(CartItem.product)
    ).filter(CartItem.user_id == user.id).all()

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0.0
    order_items = []
    for ci in cart_items:
        if ci.product.stock < ci.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {ci.product.name}")
        item_price = ci.product.price * ci.quantity
        total += item_price
        order_items.append(OrderItem(
            product_id=ci.product_id,
            quantity=ci.quantity,
            price=ci.product.price,
        ))
        ci.product.stock -= ci.quantity

    order = Order(
        user_id=user.id,
        total=round(total, 2),
        address_id=data.address_id,
    )
    db.add(order)
    db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    # Clear cart
    db.query(CartItem).filter(CartItem.user_id == user.id).delete()

    db.commit()
    db.refresh(order)

    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address)
    ).filter(Order.id == order.id).first()

    # Trigger email notifications in the background
    background_tasks.add_task(send_order_emails, order, user, db)

    return order


@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, data: OrderStatusUpdate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        order.status = OrderStatus(data.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    db.commit()
    db.refresh(order)
    order = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product),
        joinedload(Order.address)
    ).filter(Order.id == order.id).first()
    return order
