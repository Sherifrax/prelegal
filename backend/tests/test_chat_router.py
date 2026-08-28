from app.schemas_documents import DocumentData


def test_greeting_returns_a_message(client):
    response = client.get("/api/chat/greeting")
    assert response.status_code == 200
    assert response.json()["reply"]


def test_message_returns_reply_and_merged_data(client, monkeypatch):
    merged = DocumentData(doc_type="mutual-nda", fields={"purpose": "Evaluating a partnership"})

    def fake_run_chat_turn(messages, current_data):
        assert messages == [{"role": "user", "content": "Hi"}]
        return "Got it, thanks!", merged, False

    monkeypatch.setattr("app.routers.chat.run_chat_turn", fake_run_chat_turn)

    response = client.post(
        "/api/chat/message",
        json={
            "messages": [{"role": "user", "content": "Hi"}],
            "current_data": DocumentData().model_dump(by_alias=True),
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["reply"] == "Got it, thanks!"
    assert body["data"]["fields"]["purpose"] == "Evaluating a partnership"
    assert body["data"]["docType"] == "mutual-nda"
    assert body["isComplete"] is False


def test_message_without_api_key_returns_503(client, monkeypatch):
    monkeypatch.setattr("app.routers.chat.OPENROUTER_API_KEY", None)

    def unexpected_call(*args, **kwargs):
        raise AssertionError("run_chat_turn should not be called without an API key")

    monkeypatch.setattr("app.routers.chat.run_chat_turn", unexpected_call)

    response = client.post(
        "/api/chat/message",
        json={
            "messages": [{"role": "user", "content": "Hi"}],
            "current_data": DocumentData().model_dump(by_alias=True),
        },
    )

    assert response.status_code == 503
