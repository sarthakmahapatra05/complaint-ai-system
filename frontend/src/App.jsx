import ComplaintForm from "./components/ComplaintForm";
import AIAssistant from "./components/AIAssistant";
import InsightsPanel from "./components/InsightsPanel";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <div className="min-h-screen bg-ink-50 px-6 py-8">
      <header className="mx-auto mb-6 max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
          AIVOA · Quality Management System
        </p>
        <h1 className="text-xl font-semibold text-ink-900">Customer Complaint Management</h1>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        <ComplaintForm />
        <div className="space-y-6">
          <AIAssistant />
          <InsightsPanel />
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}
