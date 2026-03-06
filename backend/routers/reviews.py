from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from models import Review, User, Product
from schemas import ReviewCreate, ReviewOut
from auth import require_auth, require_admin

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewOut])
def list_reviews(product_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Review).options(joinedload(Review.user))
    if product_id:
        query = query.filter(Review.product_id == product_id)
    return query.order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut)
def create_review(data: ReviewCreate, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Review).filter(
        Review.user_id == user.id,
        Review.product_id == data.product_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this product")

    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")

    review = Review(
        rating=data.rating,
        comment=data.comment,
        user_id=user.id,
        product_id=data.product_id,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    review = db.query(Review).options(joinedload(Review.user)).filter(Review.id == review.id).first()
    return review


@router.delete("/{review_id}")
def delete_review(review_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(review)
    db.commit()
    return {"detail": "Review deleted"}
