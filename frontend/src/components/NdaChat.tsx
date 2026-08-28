"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ChatMessage, fetchGreeting, sendChatMessage } from "@/lib/chat";
import { NdaFormData } from "@/lib/types";

export default function NdaChat({
  data,
  onDataChange,
  onCompleteChange,
}: {
  data: NdaFormData;
  onDataChange: (data: NdaFormData) => void;
  onCompleteChange: (complete: boolean) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    fetchGreeting()
      .then((reply) => setMessages([{ role: "assistant", content: reply }]))
      .catch(() => setError("Couldn't reach the AI assistant. Please refresh the page."));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isSending) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsSending(true);

    try {
      const result = await sendChatMessage(nextMessages, dataRef.current);
      setMessages([...nextMessages, { role: "assistant", content: result.reply }]);
      onDataChange(result.data);
      onCompleteChange(result.isComplete);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap"
              style={
                message.role === "user"
                  ? { backgroundColor: "#209dd7", color: "white" }
                  : { backgroundColor: "#f1f5f9", color: "#032147" }
              }
            >
              {message.content}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-500">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#209dd7] focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
          style={{ backgroundColor: "#753991" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
