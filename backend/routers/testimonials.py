from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import Testimonial, User
from schemas import TestimonialCreate, TestimonialUpdate, TestimonialOut
from auth import require_admin
from typing import List

router = APIRouter(prefix="/api/testimonials", tags=["Testimonials"])

@router.get("/", response_model=List[TestimonialOut])
def get_featured_testimonials(db: Session = Depends(get_db)):
    """Public endpoint to get featured testimonials for the homepage."""
    return db.query(Testimonial).filter(Testimonial.is_featured == True).order_by(Testimonial.order.asc()).all()

@router.get("/all", response_model=List[TestimonialOut])
def get_all_testimonials(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin endpoint to list all testimonials."""
    return db.query(Testimonial).order_by(Testimonial.order.asc()).all()

@router.post("/", response_model=TestimonialOut, status_code=status.HTTP_201_CREATED)
def create_testimonial(
    data: TestimonialCreate, 
    admin: User = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    """Admin endpoint to create a new testimonial."""
    new_testimonial = Testimonial(**data.dict())
    db.add(new_testimonial)
    db.commit()
    db.refresh(new_testimonial)
    return new_testimonial

@router.put("/{testimonial_id}", response_model=TestimonialOut)
def update_testimonial(
    testimonial_id: int,
    data: TestimonialUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to update an existing testimonial."""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(testimonial, key, value)
    
    db.commit()
    db.refresh(testimonial)
    return testimonial

@router.delete("/{testimonial_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_testimonial(
    testimonial_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to delete a testimonial."""
    testimonial = db.query(Testimonial).filter(Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    
    db.delete(testimonial)
    db.commit()
    return None
