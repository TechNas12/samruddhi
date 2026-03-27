from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


class UserRoleUpdate(BaseModel):
    role: str


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[str] = None


# ── Category ──
class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ── Product ──
class ProductCreate(BaseModel):

    name: str
    slug: str
    description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    images: List[str] = []
    category_id: Optional[int] = None
    stock: int = 0
    featured: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    images: Optional[List[str]] = None
    category_id: Optional[int] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    images: List[str] = []
    category_id: Optional[int] = None
    category: Optional[CategoryOut] = None
    stock: int
    featured: bool
    avg_rating: Optional[float] = None
    review_count: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Review ──
class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    product_id: int


class ReviewOut(BaseModel):
    id: int
    rating: int
    comment: Optional[str] = None
    user_id: int
    product_id: int
    user: Optional[UserOut] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Cart ──
class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ── Wishlist ──
class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


# ── Address ──
class AddressCreate(BaseModel):
    full_name: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str
    is_default: bool = False


class AddressUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    is_default: Optional[bool] = None


class AddressOut(BaseModel):
    id: int
    full_name: str
    phone: str
    street: str
    city: str
    state: str
    pincode: str
    is_default: bool

    class Config:
        from_attributes = True


# ── Order ──
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductOut] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    address_id: int
    items: List[OrderItemCreate] = []


class OrderOut(BaseModel):
    id: int
    user_id: int
    user: Optional[UserOut] = None
    status: str
    total: float
    address_id: Optional[int] = None
    address: Optional[AddressOut] = None
    items: List[OrderItemOut] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# ── Admin Stats ──
class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int


# ── Carousel ──
class CarouselItemCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    bg_gradient: Optional[str] = None
    image: Optional[str] = None
    emoji: Optional[str] = None
    is_active: bool = True
    order: int = 0


class CarouselItemUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    bg_gradient: Optional[str] = None
    image: Optional[str] = None
    emoji: Optional[str] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None


class CarouselItemOut(BaseModel):
    id: int
    title: str
    subtitle: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    bg_gradient: Optional[str] = None
    image: Optional[str] = None
    emoji: Optional[str] = None
    is_active: bool
    order: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Settings ──
class SystemSettingBase(BaseModel):
    value: str
    description: Optional[str] = None

class SystemSettingOut(SystemSettingBase):
    key: str
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Testimonials ──
class TestimonialCreate(BaseModel):
    name: str
    location: Optional[str] = None
    rating: int
    text: str
    is_featured: bool = False
    order: int = 0

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[int] = None
    text: Optional[str] = None
    is_featured: Optional[bool] = None
    order: Optional[int] = None

class TestimonialOut(TestimonialCreate):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
