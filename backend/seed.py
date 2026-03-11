"""Seed the database with sample data for Samruddhi Organics."""
from database import SessionLocal, engine, Base
from models import User, Category, Product, Review, Order, OrderItem, Address, UserRole, OrderStatus
from auth import hash_password

# Create tables
Base.metadata.create_all(bind=engine)


def seed():
    db = SessionLocal()

    # Check if already seeded
    #if db.query(Category).first():
        #print("Database already has data. Skipping seed.")
        #db.close()
        #return

    print("Seeding database...")

    # ── Users ──
    admin = User(
        name="Sanket Dahotre",
        email="dahotresanket12@gmail.com",
        password_hash=hash_password("@Sanket12"),
        role=UserRole.ADMIN,
        phone="9834317366",
    )
    user = User(
        name="Rahul Sharma",
        email="user@test.com",
        password_hash=hash_password("samruddhi09"),
        role=UserRole.USER,
        phone="9226965735",
    )
    db.add_all([admin, user])
    db.flush()

    # ── Categories ──
    categories_data = [
        {"name": "Composts", "slug": "composts", "description": "Premium organic composts for healthy soil and thriving plants.",},
        {"name": "Fruits", "slug": "fruits", "description": "Fresh, organically grown seasonal fruits straight from the farm.",},
        {"name": "Foods", "slug": "foods", "description": "Organic food products — grains, spices, and pantry essentials.",},
        {"name": "Compost Liquids", "slug": "compost-liquids", "description": "Nutrient-rich liquid composts for rapid plant growth.",},
        {"name": "Garden Tools", "slug": "garden-tools", "description": "Essential tools for your urban gardening setup.",},
        {"name": "Seeds", "slug": "seeds", "description": "Heirloom and hybrid seeds for vegetables, herbs, and flowers.",},
    ]
    categories = []
    for c in categories_data:
        cat = Category(**c)
        db.add(cat)
        categories.append(cat)
    db.flush()

    # ── Products ──
    products_data = [
        # Composts
        {"name": "Vermicompost Premium", "slug": "vermicompost-premium", "description": "100% organic vermicompost rich in nitrogen, phosphorus, and potassium. Perfect for container gardening and raised beds. Made from earthworm castings with zero chemicals.", "price": 299.0, "compare_price": 399.0, "images": ["/images/products/vermicompost.jpg"], "category_id": 1, "stock": 50, "featured": True},
        {"name": "Cocopeat Block", "slug": "cocopeat-block", "description": "Compressed cocopeat block that expands to 7x its size. Excellent water retention and aeration for potting mixes.", "price": 149.0, "compare_price": 199.0, "images": ["/images/products/cocopeat.jpg"], "category_id": 1, "stock": 100, "featured": False},
        {"name": "Neem Cake Fertilizer", "slug": "neem-cake-fertilizer", "description": "Natural neem cake fertilizer that enriches soil and acts as a pest repellent. Slow-release nitrogen source.", "price": 199.0, "compare_price": None, "images": ["/images/products/neem-cake.jpg"], "category_id": 1, "stock": 75, "featured": False},

        # Fruits
        {"name": "Organic Alphonso Mangoes", "slug": "organic-alphonso-mangoes", "description": "Hand-picked Alphonso mangoes from Ratnagiri. No carbide ripening, naturally sweet and aromatic.", "price": 699.0, "compare_price": 899.0, "images": ["/images/products/alphonso.jpg"], "category_id": 2, "stock": 30, "featured": True},
        {"name": "Farm Fresh Strawberries", "slug": "farm-fresh-strawberries", "description": "Juicy, pesticide-free strawberries grown in Mahabaleshwar. Rich in antioxidants and vitamin C.", "price": 249.0, "compare_price": None, "images": ["/images/products/strawberries.jpg"], "category_id": 2, "stock": 25, "featured": True},
        {"name": "Organic Pomegranates", "slug": "organic-pomegranates", "description": "Ruby-red organic pomegranates packed with nutrients. Sourced from certified organic farms.", "price": 349.0, "compare_price": 449.0, "images": ["/images/products/pomegranates.jpg"], "category_id": 2, "stock": 40, "featured": False},

        # Foods
        {"name": "Cold-Pressed Groundnut Oil", "slug": "cold-pressed-groundnut-oil", "description": "Traditional wood-pressed groundnut oil. No chemicals, no preservatives. Rich nutty flavor for cooking.", "price": 449.0, "compare_price": 549.0, "images": ["/images/products/groundnut-oil.jpg"], "category_id": 3, "stock": 60, "featured": True},
        {"name": "Organic Turmeric Powder", "slug": "organic-turmeric-powder", "description": "High-curcumin turmeric powder from Sangli farms. Lab-tested for purity. No added color.", "price": 179.0, "compare_price": None, "images": ["/images/products/turmeric.jpg"], "category_id": 3, "stock": 80, "featured": False},
        {"name": "Organic Jaggery", "slug": "organic-jaggery", "description": "Chemical-free jaggery made from pure sugarcane juice. Natural sweetener with iron and minerals.", "price": 129.0, "compare_price": 159.0, "images": ["/images/products/jaggery.jpg"], "category_id": 3, "stock": 90, "featured": False},

        # Compost Liquids
        {"name": "Jeevamrut Liquid", "slug": "jeevamrut-liquid", "description": "Traditional Indian organic liquid fertilizer made from cow dung, urine, and jaggery. Boosts beneficial soil microbes.", "price": 199.0, "compare_price": 249.0, "images": ["/images/products/jeevamrut.jpg"], "category_id": 4, "stock": 45, "featured": True},
        {"name": "Seaweed Extract", "slug": "seaweed-extract", "description": "Concentrated seaweed liquid extract. Natural growth promoter with cytokinins and auxins.", "price": 349.0, "compare_price": None, "images": ["/images/products/seaweed.jpg"], "category_id": 4, "stock": 35, "featured": False},
        {"name": "Panchagavya Solution", "slug": "panchagavya-solution", "description": "Five-cow-product organic growth enhancer. Improves soil health and plant immunity naturally.", "price": 279.0, "compare_price": 329.0, "images": ["/images/products/panchagavya.jpg"], "category_id": 4, "stock": 55, "featured": False},

        # Garden Tools
        {"name": "Urban Gardening Kit", "slug": "urban-gardening-kit", "description": "Complete starter kit — includes trowel, pruner, watering can, gloves, and seed starter tray. Perfect for balcony gardens.", "price": 899.0, "compare_price": 1199.0, "images": ["/images/products/gardening-kit.jpg"], "category_id": 5, "stock": 20, "featured": True},
        {"name": "Self-Watering Planter", "slug": "self-watering-planter", "description": "Smart self-watering planter with water reservoir. Ideal for busy urban gardeners. Comes in 3 sizes.", "price": 499.0, "compare_price": None, "images": ["/images/products/planter.jpg"], "category_id": 5, "stock": 30, "featured": False},

        # Seeds
        {"name": "Kitchen Herb Seed Pack", "slug": "kitchen-herb-seed-pack", "description": "Collection of 6 herb seeds — Basil, Coriander, Mint, Parsley, Rosemary, and Thyme. Non-GMO and organic.", "price": 199.0, "compare_price": 249.0, "images": ["/images/products/herb-seeds.jpg"], "category_id": 6, "stock": 100, "featured": True},
        {"name": "Vegetable Seed Combo", "slug": "vegetable-seed-combo", "description": "10-variety vegetable seed pack — Tomato, Chilli, Brinjal, Okra, Spinach, Radish, and more. Best for beginners.", "price": 299.0, "compare_price": 399.0, "images": ["/images/products/veggie-seeds.jpg"], "category_id": 6, "stock": 70, "featured": False},
        {"name": "Flower Seed Collection", "slug": "flower-seed-collection", "description": "Beautiful flower seed mix — Marigold, Sunflower, Zinnia, Petunia, and Cosmos. Brightens any garden.", "price": 179.0, "compare_price": None, "images": ["/images/products/flower-seeds.jpg"], "category_id": 6, "stock": 85, "featured": False},
    ]

    products = []
    for p in products_data:
        prod = Product(**p)
        db.add(prod)
        products.append(prod)
    db.flush()

    # ── Reviews ──
    reviews_data = [
        {"rating": 5, "comment": "Amazing quality vermicompost! My plants are thriving.", "user_id": user.id, "product_id": 1},
        {"rating": 4, "comment": "Great mangoes, very sweet. Delivery could be faster.", "user_id": user.id, "product_id": 4},
        {"rating": 5, "comment": "Best groundnut oil I've ever bought. So pure!", "user_id": user.id, "product_id": 7},
        {"rating": 5, "comment": "The gardening kit has everything a beginner needs.", "user_id": user.id, "product_id": 13},
        {"rating": 4, "comment": "Good herb seeds, most of them germinated within a week.", "user_id": user.id, "product_id": 15},
    ]
    for r in reviews_data:
        db.add(Review(**r))

    # ── Addresses ──
    addr = Address(
        user_id=user.id,
        full_name="Rahul Sharma",
        phone="9876543211",
        street="42, Green Lane, Koregaon Park",
        city="Pune",
        state="Maharashtra",
        pincode="411001",
        is_default=True,
    )
    db.add(addr)

    db.commit()
    print("Database seeded successfully!")
    print(f"Admin: admin@samruddhi.com / admin123")
    print(f"User: user@test.com / user123")
    db.close()


if __name__ == "__main__":
    seed()
