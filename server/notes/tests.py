Great question! Let me address both your concerns: **instance vs class usage** and **how to test with pytest and mock**.

## 1. Instance vs Class Usage

**It's better to create an instance as a dependency** rather than instantiating inside the function. Here's the recommended approach:

```python
# Create a dependency function
def get_user_service() -> User_Service:
    return User_Service()

# Then use it in your dependency
async def get_current_user(
    token: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    user_service: User_Service = Depends(get_user_service)
) -> User:
    email = token['user']['email']
    return await user_service.get_user_by_email(email, session)
```

**Why?** This makes testing MUCH easier because you can override the dependency.

## 2. Testing Guide with pytest and Mock

Let me create a comprehensive testing example for you:

Now let me create one more artifact showing the improved dependency injection pattern:

## Summary

### Answer to Your Question: Instance vs Class

**Use dependency injection** - create a `get_user_service()` function and inject it:

```python
# ✅ BETTER
def get_user_service() -> User_Service:
    return User_Service()

async def get_current_user(
    user_service: User_Service = Depends(get_user_service)
):
    return await user_service.get_user_by_email(email, session)
```

**Why?** Because in tests you can do:
```python
app.dependency_overrides[get_user_service] = lambda: mock_service
```

---

## Key Testing Concepts

1. **Mock** = Fake object that replaces real dependencies
2. **Fixture** = Reusable setup code for tests
3. **AsyncMock** = Mock for async functions (what you need!)
4. **TestClient** = Simulates HTTP requests to your FastAPI app

## Testing Layers

- **Service tests**: Real database, test business logic
- **Endpoint tests**: Mocked services, test HTTP layer
- **Integration tests**: Everything together

I've created 5 artifacts for you:
1. **conftest.py** - Pytest fixtures (reusable test components)
2. **Service tests** - Testing with real database
3. **Endpoint tests** - Testing with mocks
4. **Complete guide** - Explaining everything in detail
5. **Improved pattern** - How to structure your code for easy testing

Start with the guide artifact, then look at the examples. Feel free to ask if anything is unclear!




# tests/conftest.py
"""
Pytest fixtures - reusable test components
conftest.py is automatically discovered by pytest
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import create_engine, SQLModel
from sqlmodel.pool import StaticPool
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import Mock, AsyncMock
from src.main import app  # your FastAPI app
from src.db.main import get_session
from src.db.models import User
from src.auth.service import User_Service
from src.auth.utils import generate_hashed_password


# ============= DATABASE FIXTURES =============

@pytest.fixture(name="test_engine")
def test_engine_fixture():
    """Create in-memory SQLite database for testing"""
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    return engine


@pytest.fixture(name="session")
async def session_fixture(test_engine):
    """Create a test database session"""
    async with test_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    async_session = sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


# ============= MOCK FIXTURES =============

@pytest.fixture
def mock_user_service():
    """Mock User_Service for testing without database"""
    service = Mock(spec=User_Service)
    # Make methods async
    service.get_user_by_email = AsyncMock()
    service.create_user = AsyncMock()
    service.user_exist = AsyncMock()
    service.activation_user = AsyncMock()
    return service


@pytest.fixture
def sample_user():
    """Sample user data for testing"""
    return User(
        uid="test-uid-123",
        username="testuser",
        email="test@example.com",
        first_name="Test",
        last_name="User",
        role="user",
        is_verifed=True,
        password_hash=generate_hashed_password("testpass123")
    )


@pytest.fixture
def sample_token_data():
    """Sample decoded token data"""
    return {
        "user": {
            "email": "test@example.com",
            "user_id": "test-uid-123"
        },
        "jti": "token-jti-123",
        "refresh_token": False,
        "exp": 9999999999
    }


# ============= CLIENT FIXTURES =============

@pytest.fixture
def client(session):
    """FastAPI test client with overridden database session"""
    def get_session_override():
        return session
    
    app.dependency_overrides[get_session] = get_session_override
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


# ============= AUTHENTICATION FIXTURES =============

@pytest.fixture
def auth_headers(sample_token_data):
    """Mock authentication headers"""
    from src.auth.utils import create_access_token
    token = create_access_token(sample_token_data)
    return {"Authorization": f"Bearer {token}"}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    # tests/test_user_service.py
"""
Testing the User_Service class
These tests use a real test database
"""
import pytest
from src.auth.service import User_Service
from src.auth.schema import Create_User
from src.err import UserNotFound, UserAlreadyVerify


@pytest.mark.asyncio
class TestUserService:
    """Test suite for User_Service"""
    
    async def test_create_user(self, session):
        """Test creating a new user"""
        # Arrange
        service = User_Service()
        user_data = Create_User(
            username="newuser",
            email="new@example.com",
            first_name="New",
            last_name="User",
            password="secure123"
        )
        
        # Act
        new_user = await service.create_user(user_data, session)
        
        # Assert
        assert new_user.email == "new@example.com"
        assert new_user.username == "newuser"
        assert new_user.password_hash is not None
        assert new_user.password_hash != "secure123"  # Should be hashed
        assert new_user.is_verifed is False  # Default
    
    
    async def test_get_user_by_email_exists(self, session, sample_user):
        """Test getting an existing user by email"""
        # Arrange
        service = User_Service()
        session.add(sample_user)
        await session.commit()
        
        # Act
        found_user = await service.get_user_by_email("test@example.com", session)
        
        # Assert
        assert found_user is not None
        assert found_user.email == "test@example.com"
        assert found_user.username == "testuser"
    
    
    async def test_get_user_by_email_not_exists(self, session):
        """Test getting a non-existent user"""
        # Arrange
        service = User_Service()
        
        # Act
        result = await service.get_user_by_email("nonexistent@example.com", session)
        
        # Assert
        assert result is None
    
    
    async def test_user_exist_returns_true(self, session, sample_user):
        """Test user_exist returns True for existing user"""
        # Arrange
        service = User_Service()
        session.add(sample_user)
        await session.commit()
        
        # Act
        exists = await service.user_exist("test@example.com", session)
        
        # Assert
        assert exists is True
    
    
    async def test_user_exist_returns_false(self, session):
        """Test user_exist returns False for non-existent user"""
        # Arrange
        service = User_Service()
        
        # Act
        exists = await service.user_exist("nonexistent@example.com", session)
        
        # Assert
        assert exists is False
    
    
    async def test_activation_user_success(self, session, sample_user):
        """Test activating an unverified user"""
        # Arrange
        service = User_Service()
        sample_user.is_verifed = False
        session.add(sample_user)
        await session.commit()
        
        # Act
        await service.activation_user("test@example.com", session)
        
        # Assert
        updated_user = await service.get_user_by_email("test@example.com", session)
        assert updated_user.is_verifed is True
    
    
    async def test_activation_user_not_found(self, session):
        """Test activating a non-existent user raises error"""
        # Arrange
        service = User_Service()
        
        # Act & Assert
        with pytest.raises(UserNotFound):
            await service.activation_user("nonexistent@example.com", session)
    
    
    async def test_activation_user_already_verified(self, session, sample_user):
        """Test activating an already verified user raises error"""
        # Arrange
        service = User_Service()
        sample_user.is_verifed = True
        session.add(sample_user)
        await session.commit()
        
        # Act & Assert
        with pytest.raises(UserAlreadyVerify):
            await service.activation_user("test@example.com", session)
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
    
    # Complete Guide to Pytest and Mock for FastAPI

## Table of Contents
1. [Understanding Mock](#understanding-mock)
2. [Understanding Pytest](#understanding-pytest)
3. [Testing Strategy](#testing-strategy)
4. [Common Patterns](#common-patterns)

---

## Understanding Mock

### What is Mock?
Mock creates **fake objects** that simulate real ones. This lets you test without databases, external APIs, or slow operations.

### Why Use Mock?
- **Speed**: Tests run faster (no real DB)
- **Isolation**: Test one thing at a time
- **Control**: Simulate any scenario (errors, edge cases)

### Mock vs AsyncMock
```python
# For synchronous functions
mock_service = Mock()
mock_service.get_user.return_value = user

# For async functions (FastAPI uses these!)
mock_service = AsyncMock()
mock_service.get_user.return_value = user
```

### Key Mock Methods

#### 1. `return_value` - Set what the mock returns
```python
mock_service.get_user_by_email.return_value = sample_user
# When called, returns sample_user
```

#### 2. `side_effect` - Simulate errors or different returns
```python
# Raise an exception
mock_service.get_user.side_effect = UserNotFound()

# Return different values on each call
mock_service.get_user.side_effect = [user1, user2, None]
```

#### 3. `assert_called_once()` - Verify it was called
```python
mock_service.create_user.assert_called_once()
mock_service.get_user.assert_called_with("test@example.com", session)
```

---

## Understanding Pytest

### Pytest Basics

#### Test Discovery
Pytest automatically finds tests that:
- Are in files named `test_*.py` or `*_test.py`
- Are functions named `test_*()`
- Are in classes named `Test*`

#### Running Tests
```bash
# Run all tests
pytest

# Run specific file
pytest tests/test_user_service.py

# Run specific test
pytest tests/test_user_service.py::test_create_user

# Run with output
pytest -v -s

# Run with coverage
pytest --cov=src
```

### Fixtures - Reusable Test Components

Fixtures provide **setup code** that multiple tests can use.

```python
@pytest.fixture
def sample_user():
    """This runs before each test that uses it"""
    return User(email="test@example.com", username="testuser")

def test_something(sample_user):  # Fixture injected here
    assert sample_user.email == "test@example.com"
```

#### Fixture Scopes
```python
@pytest.fixture(scope="function")  # Default: runs for each test
def user():
    return User()

@pytest.fixture(scope="module")  # Runs once per file
def db_connection():
    return create_connection()

@pytest.fixture(scope="session")  # Runs once for all tests
def app():
    return create_app()
```

### Async Tests

Use `pytest-asyncio` for async code:

```python
@pytest.mark.asyncio
async def test_async_function(session):
    result = await some_async_function(session)
    assert result is not None
```

---

## Testing Strategy

### 1. Service Layer Tests (With Real DB)
**What**: Test business logic with a real test database  
**Why**: Ensure your SQL queries and logic work correctly

```python
async def test_create_user(session):
    service = User_Service()
    user = await service.create_user(user_data, session)
    assert user.email == "test@example.com"
```

### 2. Endpoint Tests (With Mocks)
**What**: Test API routes without a database  
**Why**: Fast, isolated tests for HTTP layer

```python
def test_signup_endpoint(client, mock_user_service):
    with patch('src.auth.routes.User_Service', return_value=mock_user_service):
        response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
```

### 3. Integration Tests (Full Stack)
**What**: Test entire flow from request to database  
**Why**: Ensure everything works together

---

## Common Patterns

### Pattern 1: Testing with Real Database

```python
@pytest.mark.asyncio
async def test_user_creation(session):
    # Arrange
    service = User_Service()
    user_data = Create_User(email="test@example.com", password="pass123")
    
    # Act
    user = await service.create_user(user_data, session)
    
    # Assert
    assert user.email == "test@example.com"
    assert user.password_hash != "pass123"  # Should be hashed
```

### Pattern 2: Testing with Mocks

```python
def test_endpoint_with_mock(client, mock_user_service):
    # Arrange
    mock_user_service.user_exist.return_value = False
    
    # Override the dependency
    with patch('src.auth.routes.User_Service', return_value=mock_user_service):
        # Act
        response = client.post("/auth/signup", json={"email": "test@example.com"})
    
    # Assert
    assert response.status_code == 201
    mock_user_service.create_user.assert_called_once()
```

### Pattern 3: Testing Exceptions

```python
async def test_user_not_found(session):
    service = User_Service()
    
    with pytest.raises(UserNotFound):
        await service.activation_user("nonexistent@example.com", session)
```

### Pattern 4: Testing with Authentication

```python
def test_protected_route(client, auth_headers):
    response = client.get("/users/me", headers=auth_headers)
    assert response.status_code == 200
```

### Pattern 5: Dependency Override

```python
def test_with_override(client, mock_user_service):
    from src.main import app
    from src.auth.dependencies import get_user_service
    
    # Override the dependency
    app.dependency_overrides[get_user_service] = lambda: mock_user_service
    
    response = client.get("/users/me")
    
    # Cleanup
    app.dependency_overrides.clear()
```

---

## Quick Reference

### AAA Pattern (Arrange-Act-Assert)
```python
async def test_example(session):
    # Arrange: Set up test data
    user = User(email="test@example.com")
    
    # Act: Perform the action
    result = await service.get_user(user.email, session)
    
    # Assert: Verify the result
    assert result.email == "test@example.com"
```

### Mock Assertions
```python
mock.assert_called()                    # Called at least once
mock.assert_called_once()               # Called exactly once
mock.assert_called_with(arg1, arg2)     # Called with specific args
mock.assert_not_called()                # Never called
assert mock.call_count == 3             # Called exactly 3 times
```

### Pytest Markers
```python
@pytest.mark.asyncio              # For async tests
@pytest.mark.skip                 # Skip this test
@pytest.mark.parametrize          # Run test with multiple inputs
@pytest.mark.slow                 # Custom marker (define in pytest.ini)
```

---

## Best Practices

1. **One Assert Per Test** (when possible)
2. **Use Descriptive Test Names** - `test_login_with_invalid_password`
3. **Mock External Dependencies** - Don't test third-party code
4. **Test Edge Cases** - Empty data, null values, errors
5. **Keep Tests Independent** - Each test should work alone
6. **Use Fixtures for Setup** - Don't repeat code
7. **Test Behavior, Not Implementation** - Focus on what, not how

---

## Running Your Tests

```bash
# Install dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_user_service.py

# Run tests matching a pattern
pytest -k "test_create"

# Show print statements
pytest -s

# Generate coverage report
pytest --cov=src --cov-report=html
```



    


# src/auth/dependencies.py
"""
IMPROVED PATTERN: Dependency injection for better testability
"""
from fastapi import Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from .service import User_Service
from .bearer import AccessTokenBearer
from src.db.models import User
import logging


# ============= SERVICE DEPENDENCY =============
def get_user_service() -> User_Service:
    """
    Returns a User_Service instance.
    This can be easily overridden in tests!
    """
    return User_Service()


# ============= CURRENT USER DEPENDENCY =============
async def get_current_user(
    token: dict = Depends(AccessTokenBearer()),
    session: AsyncSession = Depends(get_session),
    user_service: User_Service = Depends(get_user_service)  # ← Injected!
) -> User:
    """
    Get the currently authenticated user.
    
    Benefits of this pattern:
    1. Easy to test - just override get_user_service()
    2. Single responsibility - each dependency has one job
    3. Flexible - can swap implementations easily
    """
    email = token['user']['email']
    
    try:
        user = await user_service.get_user_by_email(email, session)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
        
    except Exception as e:
        logging.exception(f'Error getting current user: {e}')
        raise


# ============= ROLE CHECKER DEPENDENCY =============
class RoleChecker:
    """
    Dependency for checking user roles.
    
    Usage:
        @app.get("/admin", dependencies=[Depends(RoleChecker(["admin"]))])
        async def admin_route():
            return {"message": "Admin access granted"}
    """
    
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> bool:
        """Check if user has required role"""
        if not current_user.is_verifed:
            raise EmailNotVerified()
        
        if current_user.role not in self.allowed_roles:
            raise InsufficientPermission()
        
        return True


# ============= EXAMPLE ROUTES USING DEPENDENCIES =============
# src/auth/routes.py

from fastapi import APIRouter, Depends
from .dependencies import get_current_user, get_user_service, RoleChecker
from .schema import UserResponse

router = APIRouter()


@router.get("/users/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user info.
    Testing this is easy - just override get_user_service()!
    """
    return current_user


@router.get("/admin/users", dependencies=[Depends(RoleChecker(["admin"]))])
async def list_all_users(
    user_service: User_Service = Depends(get_user_service),
    session: AsyncSession = Depends(get_session)
):
    """
    Admin-only endpoint to list all users.
    Role checking happens automatically via RoleChecker dependency.
    """
    users = await user_service.get_all_users(session)
    return {"users": users}


# ============= HOW TO TEST THIS =============
# tests/test_improved_dependencies.py

import pytest
from unittest.mock import AsyncMock
from fastapi.testclient import TestClient
from src.main import app
from src.auth.dependencies import get_user_service


def test_get_current_user_endpoint(sample_user):
    """
    Example: Testing with dependency override
    """
    # Create a mock service
    mock_service = AsyncMock()
    mock_service.get_user_by_email.return_value = sample_user
    
    # Override the dependency
    app.dependency_overrides[get_user_service] = lambda: mock_service
    
    # Make the request
    client = TestClient(app)
    response = client.get("/users/me", headers=auth_headers)
    
    # Verify
    assert response.status_code == 200
    assert response.json()["email"] == sample_user.email
    
    # Cleanup
    app.dependency_overrides.clear()


# ============= COMPARISON: OLD vs NEW =============

"""
❌ OLD PATTERN (Hard to test):
---
async def get_current_user(token=Depends(AccessTokenBearer()), session=Depends(get_session)):
    email = token['user']['email']
    return await User_Service().get_user_by_email(email, session)
    
Problems:
- Creates new User_Service() each time
- Can't mock the service in tests
- Tight coupling


✅ NEW PATTERN (Easy to test):
---
def get_user_service() -> User_Service:
    return User_Service()

async def get_current_user(
    token=Depends(AccessTokenBearer()),
    session=Depends(get_session),
    user_service=Depends(get_user_service)
):
    email = token['user']['email']
    return await user_service.get_user_by_email(email, session)

Benefits:
- Service is injected as a dependency
- Easy to override in tests: app.dependency_overrides[get_user_service] = mock
- Loose coupling
- Single Responsibility Principle
"""