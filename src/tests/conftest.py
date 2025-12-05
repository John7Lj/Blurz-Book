from unittest.mock import Mock
from src.db.main import get_session
from main import app
from fastapi.testclient import TestClient
import pytest

mock_session = Mock()
mock_user = Mock()


async def session_fake():
    async with mock_session() as session:
        
        yield session




"""overrinding some instances and fumctions to be  fake """


app.dependency_overrides[get_session] = session_fake



@pytest.fixture()
def user_mock():
    return mock_user



@pytest.fixture()
def mocking_session():
    return mock_session


@pytest.fixture()
def test_client():
    return TestClient(app)
