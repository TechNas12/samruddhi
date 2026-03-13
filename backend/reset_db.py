"""
Database Reset Script for Samruddhi Organics.
Clears all content, metrics, and non-admin users for a fresh site installation.
"""
from database import SessionLocal, engine, Base
from models import (
    User, Category, Product, Review, Order, OrderItem, 
    Address, CartItem, WishlistItem, CarouselItem, 
    SystemSetting, Testimonial, UserRole
)
from auth import hash_password

def reset_db():
    db = SessionLocal()
    print("🚀 Starting Database Reset for Samruddhi Organics...")

    try:
        # Tables to clear completely (Order matters for FK constraints)
        models_to_clear = [
            OrderItem,
            Order,
            Review,
            CartItem,
            WishlistItem,
            Address,
            Product,
            Category,
            CarouselItem,
            Testimonial,
            SystemSetting
        ]

        for model in models_to_clear:
            count = db.query(model).delete()
            print(f"✅ Cleared {count:3} records from {model.__tablename__}")

        # Clear non-admin users
        user_count = db.query(User).filter(User.role != UserRole.ADMIN).delete()
        print(f"✅ Cleared {user_count:3} non-admin user accounts")

        # Ensure default admin exists/is updated
        admin_email = "dahotresanket12@gmail.com"
        admin_password = "@Sanket12"
        
        admin = db.query(User).filter(User.email == admin_email).first()
        if admin:
            print(f"👑 Preserving Admin: {admin.name} ({admin_email})")
            admin.password_hash = hash_password(admin_password)
            admin.role = UserRole.ADMIN
        else:
            print(f"✨ Creating Default Admin: {admin_email}")
            admin = User(
                name="Sanket Dahotre",
                email=admin_email,
                password_hash=hash_password(admin_password),
                role=UserRole.ADMIN,
                phone="9834317366",
            )
            db.add(admin)

        db.commit()
        print("\n🎉 Database Reset Successful! Site is now ready for fresh content.")
        print(f"Admin Login: {admin_email}")
        print(f"Password:    {admin_password}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during reset: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    confirm = input("⚠️  WARNING: This will delete ALL data except admin accounts. Continue? (y/N): ")
    if confirm.lower() == 'y':
        reset_db()
    else:
        print("Operation cancelled.")
