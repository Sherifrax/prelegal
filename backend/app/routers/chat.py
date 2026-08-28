from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.config import OPENROUTER_API_KEY
from app.llm import GREETING, run_chat_turn
from app.schemas_nda import CamelModel, NdaFormData

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(CamelModel):
    messages: list[ChatMessage]
    current_data: NdaFormData


class ChatResponse(CamelModel):
    reply: str
    data: NdaFormData
    is_complete: bool


class GreetingResponse(BaseModel):
    reply: str


@router.get("/greeting", response_model=GreetingResponse)
def greeting():
    return GreetingResponse(reply=GREETING)


@router.post("/message", response_model=ChatResponse)
def message(payload: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "The AI chat is not configured: OPENROUTER_API_KEY is missing.",
        )

    reply, data, complete = run_chat_turn(
        [m.model_dump() for m in payload.messages], payload.current_data
    )
    return ChatResponse(reply=reply, data=data, is_complete=complete)
