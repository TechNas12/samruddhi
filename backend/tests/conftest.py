import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app
from database import Base, get_db
from models import User, Category, Product, Order, OrderItem, Review, Address, CartItem, WishlistItem, CarouselItem
import os

# Use a local SQLite database for testing
TEST_DATABASE_URL = "sqlite:///./test_samruddhi.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Create the database and tables
    Base.metadata.create_all(bind=engine)
    yield
    # Ensure all connections are closed before dropping tables and deleting file
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("./test_samruddhi.db"):
        try:
            os.remove("./test_samruddhi.db")
        except PermissionError:
            pass # Ignore if file is still locked, it's just a test DB

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
