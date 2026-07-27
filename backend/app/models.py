import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, JSON, Float

from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Complaint(Base):
    """
    One row per complaint. Structured intake fields are plain columns
    (what the form on the frontend edits); AI-derived insights are stored
    as JSON blobs since their shape can evolve without a migration.
    """

    __tablename__ = "complaints"

    id = Column(String(36), primary_key=True, default=_uuid)

    complaint_source = Column(String(120))
    customer_name = Column(String(200))

    product_name = Column(String(200))
    product_strength_grade = Column(String(120))
    batch_lot_number = Column(String(120))
    manufacturing_date = Column(String(40))
    expiry_date = Column(String(40))
    quantity_affected = Column(String(60))

    complaint_type = Column(String(120))
    complaint_date = Column(String(40))
    description = Column(Text)

    severity = Column(String(20))  # Critical | Major | Minor
    priority = Column(String(20))  # High | Medium | Low
    status = Column(String(20), default="Pending Triage")

    source_text = Column(Text)

    completeness = Column(JSON)     # {"score": 0-100, "missing_fields": [...]}
    risk_classification = Column(JSON)  # {"severity":..,"priority":..,"rationale":..}
    root_cause = Column(JSON)       # {"category": "Method", "explanation": "..."}
    capa = Column(JSON)             # {"corrective_action":..,"preventive_action":..}
    ai_summary = Column(Text)
    extraction_confidence = Column(Float)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
