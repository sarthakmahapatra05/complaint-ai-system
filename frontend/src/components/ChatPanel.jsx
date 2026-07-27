import { useState } from "react";
import { useSelector } from "react-redux";
import { askCopilot } from "../api/client";

export default function ChatPanel() {
  const form = useSelector((s) => s.complaint.form);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const q = message.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setMessage("");
    setLoading(true);
    try {
      const { answer } = await askCopilot(q, form);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4 shadow-panel">
      <div className="mb-2 max-h-40 space-y-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 text-xs ${
              m.role === "user" ? "bg-teal-50 text-teal-800" : "bg-ink-50 text-ink-700"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-ink-400">Thinking…</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask me anything about this complaint…"
          className="flex-1 rounded-md border border-ink-200 px-3 py-2 text-xs focus:border-teal-500"
        />
        <button
          onClick={send}
          disabled={loading}
          className="rounded-md bg-teal-600 px-3 py-2 text-xs font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
