from fastapi import APIRouter

from backend.app.ai.chatbot import generate_chat_response
from backend.app.core.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def create_chat_response(payload: ChatRequest) -> ChatResponse:
    return generate_chat_response(payload)
