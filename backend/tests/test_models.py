import pytest
from models import User, Category, Product, Order, OrderItem, Review, Address, CartItem, WishlistItem, CarouselItem, UserRole, OrderStatus
from sqlalchemy.orm import Session

def test_user_creation(db_session: Session):
    user = User(name="Test User", email="test@example.com", password_hash="hashed_password")
    db_session.add(user)
    db_session.commit()
    
    assert user.id is not None
    assert user.role == UserRole.USER
    assert user.email == "test@example.com"

def test_category_product_relationship(db_session: Session):
    category = Category(name="Organic Vegetables", slug="organic-vegetables")
    db_session.add(category)
    db_session.commit()
    
    product = Product(
        name="Tomato",
        slug="tomato",
        price=50.0,
        category_id=category.id,
        stock=100
    )
    db_session.add(product)
    db_session.commit()
    
    # Cross-validation: Check if product is in category.products
    assert product.id is not None
    assert product.category_id == category.id
    assert product in category.products
    assert category.products[0].name == "Tomato"

def test_review_system(db_session: Session):
    user = User(name="Reviewer", email="reviewer@example.com", password_hash="hash")
    category = Category(name="Grains", slug="grains")
    db_session.add_all([user, category])
    db_session.commit()
    
    product = Product(name="Rice", slug="rice", price=100.0, category_id=category.id)
    db_session.add(product)
    db_session.commit()
    
    review = Review(rating=5, comment="Great!", user_id=user.id, product_id=product.id)
    db_session.add(review)
    db_session.commit()
    
    # Cross-validation: Check relationships from both sides
    assert review.id is not None
    assert review in user.reviews
    assert review in product.reviews
    assert review.user == user
    assert review.product == product

def test_order_flow(db_session: Session):
    user = User(name="Buyer", email="buyer@example.com", password_hash="hash")
    address = Address(
        user_id=1, # Will be set after commit if we use relationships, but let's be explicit
        full_name="Buyer Name",
        phone="1234567890",
        street="Main St",
        city="City",
        state="State",
        pincode="123456"
    )
    db_session.add(user)
    db_session.commit()
    
    address.user_id = user.id
    db_session.add(address)
    db_session.commit()
    
    order = Order(user_id=user.id, total=150.0, address_id=address.id)
    db_session.add(order)
    db_session.commit()
    
    product = Product(name="Apple", slug="apple", price=50.0, stock=10)
    db_session.add(product)
    db_session.commit()
    
    order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=3, price=50.0)
    db_session.add(order_item)
    db_session.commit()
    
    # Cross-validation
    assert order.id is not None
    assert len(order.items) == 1
    assert order.items[0].product == product
    assert order.address == address
    assert order.user == user

def test_cart_and_wishlist(db_session: Session):
    user = User(name="Shopper", email="shopper@example.com", password_hash="hash")
    product = Product(name="Banana", slug="banana", price=30.0)
    db_session.add_all([user, product])
    db_session.commit()
    
    cart_item = CartItem(user_id=user.id, product_id=product.id, quantity=2)
    wishlist_item = WishlistItem(user_id=user.id, product_id=product.id)
    db_session.add_all([cart_item, wishlist_item])
    db_session.commit()
    
    # Cross-validation
    assert cart_item in user.cart_items
    assert wishlist_item in user.wishlist_items
    assert cart_item.product == product
    assert wishlist_item.product == product

def test_carousel_item(db_session: Session):
    item = CarouselItem(title="Flash Sale", subtitle="50% Off", cta_text="Shop Now", cta_link="/shop")
    db_session.add(item)
    db_session.commit()
    
    assert item.id is not None
    assert item.is_active is True
    assert item.order == 0
