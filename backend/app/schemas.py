from typing import Optional, Any
from pydantic import BaseModel


class ExtractRequest(BaseModel):
    text: str  # raw pasted text, or text pulled from an uploaded file


class ComplaintBase(BaseModel):
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    product_strength_grade: Optional[str] = None
    batch_lot_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    complaint_type: Optional[str] = None
    complaint_date: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None


class ComplaintCreate(ComplaintBase):
    status: Optional[str] = "Pending Triage"
    source_text: Optional[str] = None
    completeness: Optional[dict] = None
    risk_classification: Optional[dict] = None
    root_cause: Optional[dict] = None
    capa: Optional[dict] = None
    ai_summary: Optional[str] = None
    extraction_confidence: Optional[float] = None


class ComplaintOut(ComplaintBase):
    id: str
    status: str
    completeness: Optional[dict] = None
    risk_classification: Optional[dict] = None
    root_cause: Optional[dict] = None
    capa: Optional[dict] = None
    ai_summary: Optional[str] = None
    extraction_confidence: Optional[float] = None

    class Config:
        from_attributes = True


class ExtractResponse(BaseModel):
    complaint: ComplaintBase
    completeness: dict
    risk_classification: dict
    root_cause: dict
    capa: dict
    ai_summary: str
    extraction_confidence: float


class ChatRequest(BaseModel):
    message: str
    complaint: Optional[dict[str, Any]] = None  # current form state, for grounding
