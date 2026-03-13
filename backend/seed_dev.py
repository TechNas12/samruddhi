"""Seed the database with development data for Samruddhi Organics using PostgreSQL."""
from database import SessionLocal, engine, Base
from models import User, Category, Product, Review, Order, OrderItem, Address, UserRole, OrderStatus
from auth import hash_password

# Ensure all tables are created in the PostgreSQL database
Base.metadata.create_all(bind=engine)

def seed_dev():
    db = SessionLocal()
    
    print("Initializing development database seeding (PostgreSQL)...")

    # 1. Create/Update Admin User
    admin_email = "dahotresanket12@gmail.com"
    admin_password = "@Sanket12"
    
    existing_admin = db.query(User).filter(User.email == admin_email).first()
    if existing_admin:
        print(f"Admin user {admin_email} already exists. Updating password...")
        existing_admin.password_hash = hash_password(admin_password)
        admin = existing_admin
    else:
        print(f"Creating admin user: {admin_email}")
        admin = User(
            name="Sanket Dahotre",
            email=admin_email,
            password_hash=hash_password(admin_password),
            role=UserRole.ADMIN,
            phone="9834317366",
        )
        db.add(admin)
    
    db.flush()

    # 2. Basic Categories
    categories_data = [
        {"name": "Composts", "slug": "composts", "description": "Premium organic composts for healthy soil and thriving plants."},
        {"name": "Fruits", "slug": "fruits", "description": "Fresh, organically grown seasonal fruits straight from the farm."},
        {"name": "Foods", "slug": "foods", "description": "Organic food products — grains, spices, and pantry essentials."},
    ]
    
    # categories = []
    for c_data in categories_data:
        cat = db.query(Category).filter(Category.slug == c_data["slug"]).first()
        if not cat:
            cat = Category(**c_data)
            db.add(cat)
            print(f"Added category: {c_data['name']}")
    
    db.flush()

    # 3. Sample Products
    products_data = [
        {
            "name": "Vermicompost Premium", 
            "slug": "vermicompost-premium", 
            "description": "100% organic vermicompost rich in nitrogen, phosphorus, and potassium.", 
            "price": 299.0, 
            "compare_price": 399.0, 
            "category_id": 1, 
            "stock": 50, 
            "featured": True
        },
        {
            "name": "Organic Alphonso Mangoes", 
            "slug": "organic-alphonso-mangoes", 
            "description": "Hand-picked Alphonso mangoes from Ratnagiri.", 
            "price": 699.0, 
            "compare_price": 899.0, 
            "category_id": 2, 
            "stock": 30, 
            "featured": True
        }
    ]
    
    for p_data in products_data:
        prod = db.query(Product).filter(Product.slug == p_data["slug"]).first()
        if not prod:
            prod = Product(**p_data)
            db.add(prod)
            print(f"Added product: {p_data['name']}")

    db.commit()
    print("\nDevelopment database (PostgreSQL) seeded successfully!")
    print(f"Admin Login: {admin_email}")
    print(f"Admin Password: {admin_password}")
    db.close()

if __name__ == "__main__":
    seed_dev()
