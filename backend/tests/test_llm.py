import json
from types import SimpleNamespace

from app.llm import run_chat_turn
from app.schemas_nda import NdaFormData, PartyInfo, is_complete


def _fake_completion(extracted: dict):
    content = json.dumps({"reply": "ok", **extracted})
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


def test_run_chat_turn_merges_new_fields_onto_existing_data(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({"purpose": "Joint product evaluation"}),
    )

    current = NdaFormData(governing_law="Delaware")
    reply, merged, complete = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert reply == "ok"
    assert merged.purpose == "Joint product evaluation"
    assert merged.governing_law == "Delaware"  # untouched field is preserved
    assert complete is False


def test_run_chat_turn_does_not_clear_fields_left_null(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({}),
    )

    current = NdaFormData(purpose="Existing purpose")
    _, merged, _ = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert merged.purpose == "Existing purpose"


def test_run_chat_turn_merges_party_fields_independently(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({"party1_company": "Acme Inc"}),
    )

    current = NdaFormData(party1=PartyInfo(print_name="Jane Doe"))
    _, merged, _ = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert merged.party1.company == "Acme Inc"
    assert merged.party1.print_name == "Jane Doe"


def test_is_complete_true_only_once_all_required_fields_present(monkeypatch):
    complete_party = PartyInfo(
        company="Acme Inc",
        print_name="Jane Doe",
        title="CEO",
        notice_address="1 Main St",
    )
    data = NdaFormData(
        purpose="Evaluate a partnership",
        effective_date="2026-01-01",
        governing_law="Delaware",
        jurisdiction="New Castle, DE",
        party1=complete_party,
        party2=complete_party,
    )
    assert is_complete(data) is True
    assert is_complete(NdaFormData()) is False
