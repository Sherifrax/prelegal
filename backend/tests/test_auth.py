def test_signup_creates_user_and_sets_cookie(client):
    response = client.post(
        "/api/auth/signup", json={"email": "alice@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "id" in body
    assert "prelegal_session" in response.cookies


def test_signup_rejects_duplicate_email(client):
    client.post("/api/auth/signup", json={"email": "bob@example.com", "password": "password123"})
    response = client.post(
        "/api/auth/signup", json={"email": "bob@example.com", "password": "password456"}
    )
    assert response.status_code == 409


def test_signup_rejects_short_password(client):
    response = client.post(
        "/api/auth/signup", json={"email": "carol@example.com", "password": "short"}
    )
    assert response.status_code == 422


def test_signin_with_correct_credentials(client):
    client.post("/api/auth/signup", json={"email": "dave@example.com", "password": "password123"})
    response = client.post(
        "/api/auth/signin", json={"email": "dave@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "dave@example.com"


def test_signin_with_wrong_password_fails(client):
    client.post("/api/auth/signup", json={"email": "erin@example.com", "password": "password123"})
    response = client.post(
        "/api/auth/signin", json={"email": "erin@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401


def test_signin_with_unknown_email_fails(client):
    response = client.post(
        "/api/auth/signin", json={"email": "nobody@example.com", "password": "password123"}
    )
    assert response.status_code == 401


def test_me_requires_authentication(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user_after_signin(client):
    client.post("/api/auth/signup", json={"email": "frank@example.com", "password": "password123"})
    response = client.get("/api/auth/me")
    assert response.status_code == 200
    assert response.json()["email"] == "frank@example.com"


def test_signout_clears_session(client):
    client.post("/api/auth/signup", json={"email": "grace@example.com", "password": "password123"})
    assert client.get("/api/auth/me").status_code == 200

    signout_response = client.post("/api/auth/signout")
    assert signout_response.status_code == 204

    assert client.get("/api/auth/me").status_code == 401
