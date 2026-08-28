import json
from types import SimpleNamespace

from app.document_types import DOCUMENT_TYPES
from app.llm import run_chat_turn
from app.schemas_documents import DocumentData, PartyInfo, empty_document_data, is_complete

MNDA_SPEC = DOCUMENT_TYPES["mutual-nda"]
CSA_SPEC = DOCUMENT_TYPES["csa"]


def _fake_completion(extracted: dict):
    content = json.dumps({"reply": "ok", **extracted})
    return SimpleNamespace(
        choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
    )


def test_run_chat_turn_detects_doc_type_then_extracts_fields_in_one_turn(monkeypatch):
    calls = []

    def fake_completion(**kwargs):
        calls.append(kwargs)
        if len(calls) == 1:
            return _fake_completion({"doc_type": "mutual-nda"})
        return _fake_completion({"purpose": "Joint product evaluation"})

    monkeypatch.setattr("app.llm.completion", fake_completion)

    current = DocumentData()
    reply, merged, complete = run_chat_turn(
        [{"role": "user", "content": "I need an NDA"}], current
    )

    assert len(calls) == 2
    assert merged.doc_type == "mutual-nda"
    assert merged.fields["purpose"] == "Joint product evaluation"
    assert reply == "ok"
    assert complete is False


def test_run_chat_turn_stays_undetected_when_type_unclear(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion", lambda **kwargs: _fake_completion({"doc_type": None})
    )

    current = DocumentData()
    reply, data, complete = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert reply == "ok"
    assert data.doc_type is None
    assert complete is False


def test_run_chat_turn_merges_new_fields_onto_existing_data(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({"purpose": "Joint product evaluation"}),
    )

    current = empty_document_data(MNDA_SPEC)
    current.fields["governing_law"] = "Delaware"
    reply, merged, complete = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert reply == "ok"
    assert merged.fields["purpose"] == "Joint product evaluation"
    assert merged.fields["governing_law"] == "Delaware"  # untouched field is preserved
    assert complete is False


def test_run_chat_turn_does_not_clear_fields_left_null(monkeypatch):
    monkeypatch.setattr("app.llm.completion", lambda **kwargs: _fake_completion({}))

    current = empty_document_data(MNDA_SPEC)
    current.fields["purpose"] = "Existing purpose"
    _, merged, _ = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert merged.fields["purpose"] == "Existing purpose"


def test_run_chat_turn_merges_party_fields_independently(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({"party1_company": "Acme Inc"}),
    )

    current = empty_document_data(MNDA_SPEC)
    current.parties["party1"] = PartyInfo(print_name="Jane Doe")
    _, merged, _ = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert merged.parties["party1"].company == "Acme Inc"
    assert merged.parties["party1"].print_name == "Jane Doe"


def test_run_chat_turn_works_generically_for_a_different_document_type(monkeypatch):
    monkeypatch.setattr(
        "app.llm.completion",
        lambda **kwargs: _fake_completion({"subscription_period": "12 months"}),
    )

    current = empty_document_data(CSA_SPEC)
    _, merged, _ = run_chat_turn([{"role": "user", "content": "hi"}], current)

    assert merged.fields["subscription_period"] == "12 months"


def test_is_complete_true_only_once_all_required_fields_present():
    complete_party = PartyInfo(
        company="Acme Inc",
        print_name="Jane Doe",
        title="CEO",
        notice_address="1 Main St",
    )
    data = DocumentData(
        doc_type="mutual-nda",
        fields={
            "purpose": "Evaluate a partnership",
            "effective_date": "2026-01-01",
            "mnda_term_type": "expires",
            "mnda_term_years": "1",
            "confidentiality_term_type": "years",
            "confidentiality_term_years": "1",
            "governing_law": "Delaware",
            "jurisdiction": "New Castle, DE",
        },
        parties={"party1": complete_party, "party2": complete_party},
    )
    assert is_complete(data, MNDA_SPEC) is True
    assert is_complete(empty_document_data(MNDA_SPEC), MNDA_SPEC) is False


def test_is_complete_ignores_conditional_field_when_not_applicable():
    complete_party = PartyInfo(
        company="Acme Inc",
        print_name="Jane Doe",
        title="CEO",
        notice_address="1 Main St",
    )
    data = DocumentData(
        doc_type="mutual-nda",
        fields={
            "purpose": "Evaluate a partnership",
            "effective_date": "2026-01-01",
            "mnda_term_type": "until-terminated",
            "confidentiality_term_type": "perpetuity",
            "governing_law": "Delaware",
            "jurisdiction": "New Castle, DE",
        },
        parties={"party1": complete_party, "party2": complete_party},
    )
    # mnda_term_years / confidentiality_term_years are not required here since
    # the term types aren't "expires"/"years".
    assert is_complete(data, MNDA_SPEC) is True


def test_is_complete_respects_light_party_requirements():
    sla_spec = DOCUMENT_TYPES["sla"]
    data = DocumentData(
        doc_type="sla",
        fields={
            "target_uptime": "99.9%",
            "target_response_time": "4 business hours",
            "support_channel": "support@example.com",
            "uptime_credit": "10% of monthly fees",
            "response_time_credit": "5% of monthly fees",
        },
        parties={
            "party1": PartyInfo(company="Acme Inc"),
            "party2": PartyInfo(company="Other Co"),
        },
    )
    assert is_complete(data, sla_spec) is True
