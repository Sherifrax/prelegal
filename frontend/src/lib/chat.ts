import { DocumentData } from "./types";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatMessageResult {
  reply: string;
  data: DocumentData;
  isComplete: boolean;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // fall through to generic message
  }
  return "Something went wrong. Please try again.";
}

export async function fetchGreeting(): Promise<string> {
  const response = await fetch("/api/chat/greeting");
  if (!response.ok) throw new Error(await parseErrorMessage(response));
  const body: { reply: string } = await response.json();
  return body.reply;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  currentData: DocumentData
): Promise<ChatMessageResult> {
  const response = await fetch("/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, currentData }),
  });
  if (!response.ok) throw new Error(await parseErrorMessage(response));
  return response.json();
}
