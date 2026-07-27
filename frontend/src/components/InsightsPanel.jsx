import { useSelector } from "react-redux";

const SEVERITY_STYLE = {
  Critical: "bg-rose-100 text-rose-600",
  Major: "bg-amber-100 text-amber-600",
  Minor: "bg-teal-100 text-teal-700",
};

export default function InsightsPanel() {
  const insights = useSelector((s) => s.complaint.insights);
  const { completeness, risk_classification, root_cause, capa, ai_summary, extraction_confidence } = insights;

  if (!completeness) return null; // nothing extracted yet

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-panel">
      <h2 className="mb-4 text-sm font-semibold text-ink-900">AI Copilot Risk Assessment</h2>

      {ai_summary && (
        <p className="mb-4 rounded-lg bg-ink-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
          {ai_summary}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-ink-400">
            <span>Completeness</span>
            <span>{completeness.score}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${completeness.score}%` }}
            />
          </div>
          {completeness.missing_fields?.length > 0 && (
            <p className="mt-1 text-[11px] text-ink-400">
              Missing: {completeness.missing_fields.join(", ")}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-400">
            Extraction Confidence
          </div>
          <div className="text-sm font-semibold text-ink-800">
            {Math.round((extraction_confidence || 0) * 100)}%
          </div>
        </div>
      </div>

      {risk_classification && (
        <div className="mt-4 rounded-lg border border-ink-100 p-3">
          <div className="mb-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${SEVERITY_STYLE[risk_classification.severity] || "bg-ink-100 text-ink-600"}`}>
              {risk_classification.severity}
            </span>
            <span className="text-xs text-ink-400">Priority: {risk_classification.priority}</span>
          </div>
          <p className="text-xs text-ink-600">{risk_classification.rationale}</p>
        </div>
      )}

      {root_cause && (
        <div className="mt-3 rounded-lg border border-ink-100 p-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Root Cause Hypothesis · {root_cause.category}
          </div>
          <p className="text-xs text-ink-600">{root_cause.explanation}</p>
        </div>
      )}

      {capa && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-ink-100 p-3">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Corrective Action (AI draft)
            </div>
            <p className="text-xs text-ink-600">{capa.corrective_action}</p>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Preventive Action (AI draft)
            </div>
            <p className="text-xs text-ink-600">{capa.preventive_action}</p>
          </div>
        </div>
      )}

      <p className="mt-3 text-[10px] text-ink-400">
        AI responses may contain errors. Please verify before finalizing.
      </p>
    </div>
  );
}
