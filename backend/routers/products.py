from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional, List
from database import get_db
from models import Product, Review, Category, User
from schemas import ProductCreate, ProductUpdate, ProductOut
from auth import require_admin, get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])


def product_to_out(product, db) -> dict:
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("review_count")
    ).filter(Review.product_id == product.id).first()

    data = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "price": product.price,
        "compare_price": product.compare_price,
        "images": product.images or [],
        "category_id": product.category_id,
        "category": product.category,
        "stock": product.stock,
        "featured": product.featured,
        "avg_rating": round(float(stats.avg_rating), 1) if stats.avg_rating else None,
        "review_count": stats.review_count or 0,
        "created_at": product.created_at,
    }
    return data


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[int] = None,
    featured: Optional[bool] = None,
    sort_by: Optional[str] = Query(None, pattern="^(price_asc|price_desc|newest|rating)$"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Product).options(joinedload(Product.category))

    if category:
        query = query.join(Category).filter(Category.slug == category)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if featured is not None:
        query = query.filter(Product.featured == featured)

    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    products = query.offset(skip).limit(limit).all()
    result = []
    for p in products:
        result.append(product_to_out(p, db))

    if min_rating is not None:
        result = [r for r in result if r.get("avg_rating") and r["avg_rating"] >= min_rating]

    return result


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.category)).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_out(product, db)


@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product_to_out(product, db)


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product_to_out(product, db)


@router.delete("/{product_id}")
def delete_product(product_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"detail": "Product deleted"}
