from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.graph import run_pipeline
from app.llm import call_text
from app.schemas import ExtractRequest, ExtractResponse, ChatRequest

router = APIRouter(prefix="/api/ai", tags=["ai"])
settings = get_settings()


@router.post("/extract", response_model=ExtractResponse)
def extract(payload: ExtractRequest):
    """Run the full LangGraph pipeline: extract -> analyse -> summarise."""
    if not payload.text or not payload.text.strip():
        raise HTTPException(400, "No text provided")
    try:
        result = run_pipeline(payload.text)
    except RuntimeError as e:
        raise HTTPException(503, str(e))

    return ExtractResponse(
        complaint=result["complaint"],
        completeness=result["completeness"],
        risk_classification=result["risk_classification"],
        root_cause=result["root_cause"],
        capa=result["capa"],
        ai_summary=result["ai_summary"],
        extraction_confidence=result["extraction_confidence"],
    )


@router.post("/chat")
def chat(payload: ChatRequest):
    """Lightweight Q&A grounded in the complaint currently on screen."""
    system = (
        "You are the AI Copilot inside a pharmaceutical QMS Customer "
        "Complaint form. Answer the reviewer's question using ONLY the "
        "complaint context provided. Be concise (2-4 sentences). If the "
        "context doesn't contain the answer, say so plainly."
    )
    user = f"Complaint context:\n{payload.complaint}\n\nQuestion: {payload.message}"
    try:
        answer = call_text(settings.reasoning_model, system, user)
    except RuntimeError as e:
        raise HTTPException(503, str(e))
    return {"answer": answer}
