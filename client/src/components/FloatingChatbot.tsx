import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[320px] rounded-xl border border-white/10 bg-card/95 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <p className="text-white font-display text-sm">REDOXY AI Concierge</p>
            <button
              type="button"
              className="text-gray-300 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 text-sm text-gray-300">
            <p>AI assistant placeholder. Connect Dialogflow/OpenAI here.</p>
          </div>
          <div className="p-4 border-t border-white/10">
            <input
              className="w-full rounded-md bg-background/60 border border-white/10 px-3 py-2 text-sm text-white"
              placeholder="Ask about services, trading, MTU..."
            />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        aria-label="Open AI Chatbot"
        className="btn-premium h-12 w-12 rounded-full p-0"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MessageSquare className="h-5 w-5" />
      </button>
    </div>
  );
}
