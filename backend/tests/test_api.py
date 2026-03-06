import pytest
from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Samruddhi Organics API", "docs": "/docs"}

def test_get_products(client: TestClient, db_session):
    from models import Category, Product
    cat = Category(name="Test Cat", slug="test-cat")
    db_session.add(cat)
    db_session.commit()
    prod = Product(name="Test Prod", slug="test-prod", price=10.0, category_id=cat.id, stock=5)
    db_session.add(prod)
    db_session.commit()

    response = client.get("/api/products")
    assert response.status_code == 200
    assert len(response.json()) >= 1

def test_create_user_and_login(client: TestClient):
    # Register - Prefix is /api/auth
    register_data = {
        "name": "Test API User",
        "email": "api@test.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/register", json=register_data)
    assert response.status_code == 200
    assert response.json()["email"] == "api@test.com"
    
    # Login
    login_data = {
        "email": "api@test.com",
        "password": "testpassword123"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()
    token = response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"
    return token

def test_get_categories(client: TestClient):
    response = client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_to_cart_authenticated(client: TestClient, db_session):
    from models import Category, Product
    # Setup: Create a category and product
    cat = Category(name="Cart Cat", slug="cart-cat")
    db_session.add(cat)
    db_session.commit()
    prod = Product(name="Cart Prod", slug="cart-prod", price=10.0, category_id=cat.id, stock=5)
    db_session.add(prod)
    db_session.commit()

    # Login to get token
    token = test_create_user_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # Add to cart - Endpoint is POST /api/cart
    cart_data = {"product_id": prod.id, "quantity": 1}
    response = client.post("/api/cart", json=cart_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["product_id"] == prod.id
    assert response.json()["quantity"] == 1
