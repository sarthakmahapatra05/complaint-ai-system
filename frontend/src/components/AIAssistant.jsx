import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { runExtraction } from "../store/complaintSlice";

export default function AIAssistant() {
  const dispatch = useDispatch();
  const status = useSelector((s) => s.complaint.extractionStatus);
  const error = useSelector((s) => s.complaint.extractionError);
  const [text, setText] = useState("");
  const fileInput = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const content = await file.text();
    setText(content);
  };

  const submit = () => {
    if (!text.trim()) return;
    dispatch(runExtraction(text));
  };

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-6 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">AI Complaint Intake Assistant</h2>
        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-teal-700">
          Beta
        </span>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => fileInput.current?.click()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center transition hover:border-teal-500"
      >
        <p className="text-sm text-ink-600">
          Drag &amp; drop complaint document here
          <br />
          <span className="text-teal-600">or click to browse</span>
        </p>
        <input
          ref={fileInput}
          type="file"
          accept=".txt,.eml,.md"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="my-3 flex items-center gap-3 text-xs text-ink-400">
        <div className="h-px flex-1 bg-ink-100" />
        OR
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste complaint text / email…"
        className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 focus:border-teal-500"
      />
      <p className="mt-1 text-[11px] text-ink-400">Supported: PDF, DOCX, TXT, EML text content · Max 10MB</p>

      <button
        onClick={submit}
        disabled={status === "loading" || !text.trim()}
        className="mt-3 w-full rounded-md bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {status === "loading" ? "Analyzing complaint…" : "Extract & Analyze"}
      </button>

      {status === "loading" && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-teal-500" />
        </div>
      )}

      <div className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-sm text-ink-600">
        {status === "idle" && "Upload a complaint document or paste text above. I'll extract the details, assess risk, and populate the form for you."}
        {status === "loading" && "Running extraction, risk classification, and root-cause analysis…"}
        {status === "succeeded" && "Done — form populated on the left. Review the AI insights below before saving."}
        {status === "failed" && (
          <span className="text-rose-600">Extraction failed: {error}</span>
        )}
      </div>
    </div>
  );
}
