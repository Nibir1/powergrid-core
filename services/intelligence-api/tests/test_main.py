import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.rag_service import IntelligenceEngine

# REVERTED: Simple is better.
# We pass 'app' directly. If it gives a warning, we will silence it in pytest.ini.
client = TestClient(app)

# Mock the OpenAI Engine
@pytest.fixture
def mock_engine(mocker):
    mock = mocker.patch("app.main.engine", autospec=True)
    return mock

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "active", "service": "intelligence-api"}

def test_ask_question_success(mock_engine):
    # Setup Mock return value
    mock_response = {
        "answer": "The target is 3%.",
        "citations": [{"document": "EED", "section": "Article 5"}],
        "confidence_score": 0.95
    }
    mock_engine.ask_llm.return_value = mock_response

    # Perform Request
    payload = {"question": "What is the renovation target?", "context_filter": "general"}
    response = client.post("/api/compliance/ask", json=payload)

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "The target is 3%."
    assert len(data["citations"]) == 1

def test_ask_question_empty():
    payload = {"question": ""}
    response = client.post("/api/compliance/ask", json=payload)
    assert response.status_code == 400