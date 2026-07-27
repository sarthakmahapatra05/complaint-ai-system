import { useDispatch, useSelector } from "react-redux";
import { updateField, resetForm, persistComplaint } from "../store/complaintSlice";

const SEVERITIES = ["Critical", "Major", "Minor"];
const PRIORITIES = ["High", "Medium", "Low"];

function Field({ label, field, value, onChange, type = "text", placeholder }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder || "Awaiting AI extraction…"}
        onChange={(e) => onChange(field, e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400/70 focus:border-teal-500"
      />
    </label>
  );
}

function Select({ label, field, value, options, onChange }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(field, e.target.value)}
        className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 focus:border-teal-500"
      >
        <option value="">Awaiting AI extraction…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeading({ n, title }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[11px] font-semibold text-white">
        {n}
      </span>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-600">
        {title}
      </h3>
    </div>
  );
}

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const form = useSelector((s) => s.complaint.form);
  const saveStatus = useSelector((s) => s.complaint.saveStatus);
  const savedId = useSelector((s) => s.complaint.savedId);

  const set = (field, value) => dispatch(updateField({ field, value }));

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-panel">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-900">Log Customer Complaint</h2>
          <p className="text-xs text-ink-400">API &amp; FDF Quality Assurance Module</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-600">
          {form.severity ? "Triaged" : "Pending Triage"}
        </span>
      </div>

      <div className="space-y-6">
        <section>
          <SectionHeading n={1} title="Origin & Customer Details" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Complaint Source" field="complaint_source" value={form.complaint_source} onChange={set} />
            <Field label="Customer Name" field="customer_name" value={form.customer_name} onChange={set} />
          </div>
        </section>

        <section>
          <SectionHeading n={2} title="Product & Batch Identification" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name" field="product_name" value={form.product_name} onChange={set} />
            <Field label="Product Strength / Grade" field="product_strength_grade" value={form.product_strength_grade} onChange={set} />
            <Field label="Batch / Lot Number" field="batch_lot_number" value={form.batch_lot_number} onChange={set} />
            <Field label="Manufacturing Date" field="manufacturing_date" value={form.manufacturing_date} onChange={set} type="date" />
            <Field label="Expiry Date" field="expiry_date" value={form.expiry_date} onChange={set} type="date" />
            <Field label="Quantity Affected" field="quantity_affected" value={form.quantity_affected} onChange={set} />
          </div>
        </section>

        <section>
          <SectionHeading n={3} title="Complaint Details" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Complaint Type" field="complaint_type" value={form.complaint_type} onChange={set} />
            <Field label="Complaint Date" field="complaint_date" value={form.complaint_date} onChange={set} type="date" />
          </div>
          <div className="mt-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                Detailed Complaint Description
              </span>
              <textarea
                rows={3}
                value={form.description || ""}
                placeholder="Awaiting AI extraction…"
                onChange={(e) => set("description", e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400/70 focus:border-teal-500"
              />
            </label>
          </div>
        </section>

        <section>
          <SectionHeading n={4} title="Initial Assessment & Priority" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Severity" field="severity" value={form.severity} options={SEVERITIES} onChange={set} />
            <Select label="Priority" field="priority" value={form.priority} options={PRIORITIES} onChange={set} />
          </div>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-4">
        <button
          onClick={() => dispatch(resetForm())}
          className="rounded-md px-3 py-2 text-sm font-medium text-ink-400 hover:bg-ink-50"
        >
          Reset form
        </button>
        <div className="flex items-center gap-3">
          {saveStatus === "succeeded" && (
            <span className="text-xs text-teal-600">Saved · #{savedId?.slice(0, 8)}</span>
          )}
          {saveStatus === "failed" && (
            <span className="text-xs text-rose-500">Save failed</span>
          )}
          <button
            onClick={() => dispatch(persistComplaint())}
            disabled={saveStatus === "loading"}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saveStatus === "loading" ? "Saving…" : "Save Complaint"}
          </button>
        </div>
      </div>
    </div>
  );
}
