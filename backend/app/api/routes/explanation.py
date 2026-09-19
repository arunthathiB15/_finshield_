from fastapi import APIRouter

from backend.app.ai.explainer import generate_explanation
from backend.app.core.schemas import ExplanationRequest, ExplanationResponse

router = APIRouter(prefix="/api/explanation", tags=["explanation"])


@router.post("", response_model=ExplanationResponse)
def create_explanation(payload: ExplanationRequest) -> ExplanationResponse:
    return generate_explanation(payload.analysis, payload.question)
