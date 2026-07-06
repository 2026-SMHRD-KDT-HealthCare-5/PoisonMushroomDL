from fastapi import APIRouter

from app.schemas import AskRequest, AskResponse
from app.services import rag

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest):
    answer = rag.ask_followup(payload.class_code, payload.question)
    return AskResponse(answer=answer)
