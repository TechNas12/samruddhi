from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import CarouselItem, User
from schemas import CarouselItemCreate, CarouselItemUpdate, CarouselItemOut
from auth import require_admin

router = APIRouter(prefix="/api/carousel", tags=["Carousel"])


@router.get("", response_model=List[CarouselItemOut])
def get_carousel_items(db: Session = Depends(get_db)):
    """Public endpoint to get active carousel items."""
    items = db.query(CarouselItem).filter(CarouselItem.is_active == True).order_by(CarouselItem.order.asc(), CarouselItem.id.desc()).all()
    return items


@router.get("/all", response_model=List[CarouselItemOut])
def get_all_carousel_items(current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Admin endpoint to get all carousel items (including inactive)."""
    items = db.query(CarouselItem).order_by(CarouselItem.order.asc(), CarouselItem.id.desc()).all()
    return items


@router.post("", response_model=CarouselItemOut, status_code=status.HTTP_201_CREATED)
def create_carousel_item(
    item_in: CarouselItemCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    item = CarouselItem(**item_in.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=CarouselItemOut)
def update_carousel_item(
    item_id: int,
    item_in: CarouselItemUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    item = db.query(CarouselItem).filter(CarouselItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Carousel item not found")

    update_data = item_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_carousel_item(
    item_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    item = db.query(CarouselItem).filter(CarouselItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Carousel item not found")

    db.delete(item)
    db.commit()
    return None
