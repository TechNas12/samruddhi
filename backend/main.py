import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine, Base
from routers import users, products, categories, reviews, cart, wishlist, orders, addresses, admin, carousel, uploads, settings, testimonials

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    # In production, it's better to use Alembic migrations, but this keeps it working for now.
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Error creating tables: {e}")
    yield

app = FastAPI(
    title="Samruddhi Organics API",
    description="Backend API for Samruddhi Organics e-commerce store",
    version="1.0.0",
    lifespan=lifespan,
)


# CORS middleware
origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(reviews.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(addresses.router)
app.include_router(admin.router)
app.include_router(carousel.router)
app.include_router(uploads.router)
app.include_router(settings.router)
app.include_router(testimonials.router)

# Serve uploaded images as static files
uploads_dir = Path(__file__).parent / "uploads"
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")


@app.get("/")
def root():
    return {"message": "Samruddhi Organics API", "docs": "/docs"}
