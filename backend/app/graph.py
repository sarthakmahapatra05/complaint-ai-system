"""
LangGraph agent workflow for the Customer Complaint Management System.

Design:
    START -> extract -> ┬─ completeness_check ────────────────┬-> summary -> END
                         ├─ risk_classification ─┬-> capa ─────┤
                         └─ root_cause_analysis ─┘

`extract` runs first because everything downstream reads its output.
From there, completeness/risk/root-cause are *independent* of each other,
so they run as parallel branches (fan-out) instead of a sequential chain —
this is the main latency win: 3 LLM calls in parallel instead of in series.
`capa` needs both risk and root-cause, and `summary` needs completeness and
capa, so LangGraph joins those branches (fan-in) before running them.

`completeness_check` is plain Python, not an LLM call — it's a deterministic
rule (which required fields are empty), so spending a model call on it would
only add latency and cost for no benefit.
"""
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, START, END

from app.config import get_settings
from app.llm import call_json, call_text

settings = get_settings()

REQUIRED_FIELDS = [
    "complaint_source", "customer_name", "product_name", "batch_lot_number",
    "manufacturing_date", "expiry_date", "complaint_type", "description",
]


class ComplaintState(TypedDict, total=False):
    raw_text: str
    complaint: dict
    extraction_confidence: float
    completeness: dict
    risk_classification: dict
    root_cause: dict
    capa: dict
    ai_summary: str



def extract_node(state: ComplaintState) -> dict:
    system = (
        "You are an intake assistant for a pharmaceutical Quality Management "
        "System (QMS), extracting structured data from a customer complaint "
        "(API/FDF manufacturing). Return ONLY a JSON object with these keys: "
        "complaint_source, customer_name, product_name, product_strength_grade, "
        "batch_lot_number, manufacturing_date, expiry_date, quantity_affected, "
        "complaint_type, complaint_date, description, confidence. "
        "Dates as YYYY-MM-DD if present. `description` is a clear 1-3 sentence "
        "restatement of the complaint. `confidence` is a 0-1 float reflecting "
        "how completely the source text supports the extraction. Use null for "
        "any field you cannot find in the text — never invent values."
    )
    result = call_json(settings.extraction_model, system, state["raw_text"])
    confidence = float(result.pop("confidence", 0.5) or 0.5)
    return {"complaint": result, "extraction_confidence": confidence}


def completeness_node(state: ComplaintState) -> dict:
    complaint = state["complaint"]
    missing = [f for f in REQUIRED_FIELDS if not complaint.get(f)]
    score = round(100 * (len(REQUIRED_FIELDS) - len(missing)) / len(REQUIRED_FIELDS))
    return {"completeness": {"score": score, "missing_fields": missing}}


def risk_classification_node(state: ComplaintState) -> dict:
    system = (
        "You are a pharmaceutical QMS risk assessor. Given complaint details, "
        "classify severity as one of Critical/Major/Minor and priority as one "
        "of High/Medium/Low, per ICH Q9 style quality-risk-management thinking "
        "(patient safety impact, GMP impact, regulatory reportability). Return "
        "ONLY JSON: {\"severity\": ..., \"priority\": ..., \"rationale\": "
        "\"<one sentence>\"}."
    )
    result = call_json(settings.reasoning_model, system, str(state["complaint"]))
    return {"risk_classification": result}


def root_cause_node(state: ComplaintState) -> dict:
    system = (
        "You are a QMS investigator using the 6M / Ishikawa framework "
        "(Man, Machine, Method, Material, Measurement, Environment). Based on "
        "the complaint details, suggest the single most likely root-cause "
        "category and a one-sentence hypothesis a QA investigator should "
        "verify. This is a preliminary AI hypothesis, not a confirmed "
        "investigation finding. Return ONLY JSON: {\"category\": ..., "
        "\"explanation\": ...}."
    )
    result = call_json(settings.reasoning_model, system, str(state["complaint"]))
    return {"root_cause": result}


def capa_node(state: ComplaintState) -> dict:
    system = (
        "You are a QMS CAPA (Corrective and Preventive Action) advisor. Given "
        "the complaint, its AI risk classification, and its AI root-cause "
        "hypothesis, propose one concrete corrective action (fixes this "
        "instance) and one preventive action (stops recurrence). These are "
        "AI-generated drafts for a QA reviewer, not final CAPA records. Return "
        "ONLY JSON: {\"corrective_action\": ..., \"preventive_action\": ...}."
    )
    payload = {
        "complaint": state["complaint"],
        "risk": state["risk_classification"],
        "root_cause": state["root_cause"],
    }
    result = call_json(settings.reasoning_model, system, str(payload))
    return {"capa": result}


def summary_node(state: ComplaintState) -> dict:
    system = (
        "Write a crisp 2-3 sentence executive summary of this pharmaceutical "
        "customer complaint for a QA reviewer's dashboard: what happened, its "
        "risk level, and the recommended next step. Plain prose, no headers."
    )
    payload = {
        "complaint": state["complaint"],
        "completeness": state["completeness"],
        "risk": state["risk_classification"],
        "root_cause": state["root_cause"],
        "capa": state["capa"],
    }
    text = call_text(settings.extraction_model, system, str(payload))
    return {"ai_summary": text}



def build_graph():
    graph = StateGraph(ComplaintState)

    graph.add_node("extract", extract_node)
    graph.add_node("completeness_check", completeness_node)
    graph.add_node("risk_classification", risk_classification_node)
    graph.add_node("root_cause_analysis", root_cause_node)
    graph.add_node("capa", capa_node)
    graph.add_node("summary", summary_node)

    graph.add_edge(START, "extract")

    graph.add_edge("extract", "completeness_check")
    graph.add_edge("extract", "risk_classification")
    graph.add_edge("extract", "root_cause_analysis")

    graph.add_edge("risk_classification", "capa")
    graph.add_edge("root_cause_analysis", "capa")

    graph.add_edge("completeness_check", "summary")
    graph.add_edge("capa", "summary")

    graph.add_edge("summary", END)

    return graph.compile()


_compiled_graph: Optional[object] = None


def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_pipeline(raw_text: str) -> ComplaintState:
    graph = get_graph()
    return graph.invoke({"raw_text": raw_text})
