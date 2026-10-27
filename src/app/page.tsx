"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type ChatRule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
  intent?: string;
};

const chatRules = rules as ChatRule[];

const WELCOME_MESSAGE =
  "Hello! Welcome to the Library Management Helpdesk. 📚\n\nI can help you with book searches, borrowing books, returns, due dates, and library rules. How can I help you today?";

const FALLBACK_MESSAGE =
  "I'm sorry, I couldn't find a matching answer. Please ask about book searches, borrowing, book returns, due dates, or library rules.";

const QUICK_QUESTIONS = [
  "How do I find a book?",
  "How can I borrow a book?",
  "How do I return a book?",
  "How can I check my due date?",
  "What are the library rules?",
];

function normalizeMessage(message: string): string {
  return message.toLowerCase().trim().replace(/\s+/g, " ");
}

function getBotReply(message: string): {
  reply: string;
  intent?: string;
} {
  const normalizedMessage = normalizeMessage(message);

  // Match complete phrases first, then individual keywords.
  const matchingRule = chatRules.find((rule) =>
    rule.keywords.some((keyword) => {
      const normalizedKeyword = normalizeMessage(keyword);

      if (normalizedMessage === normalizedKeyword) {
        return true;
      }

      // Phrase matching helps avoid accidental partial-word matches.
      const escapedKeyword = normalizedKeyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const pattern = new RegExp(
        `(^|[^a-z0-9])${escapedKeyword}([^a-z0-9]|$)`
      );

      return pattern.test(normalizedMessage);
    })
  );

  if (matchingRule) {
    return {
      reply: matchingRule.reply,
      intent: matchingRule.intent,
    };
  }

  return { reply: FALLBACK_MESSAGE };
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: WELCOME_MESSAGE,
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  function sendMessage(text: string) {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || isTyping) return;

    const userMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text: trimmedMessage,
    };

    const { reply, intent } = getBotReply(trimmedMessage);

    const botMessage: Message = {
      id: nextId.current++,
      sender: "bot",
      text: reply,
      intent,
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      botMessage,
    ]);

    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input);
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex h-[calc(100dvh-2.5rem)] max-h-[900px] min-h-[520px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:h-[calc(100dvh-4rem)]">
        {/* Header */}
        <header className="flex items-center gap-3 bg-indigo-700 px-4 py-4 text-white sm:px-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl">
            📚
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold sm:text-xl">
              Library Management Helpdesk Bot
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-indigo-100 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Rule-based assistant · Available anytime
            </div>
          </div>
        </header>

        {/* Chat messages */}
        <section
          aria-label="Chat messages"
          aria-live="polite"
          className="flex-1 space-y-5 overflow-y-auto bg-slate-50 px-3 py-5 sm:px-6"
        >
          <div className="text-center">
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-600">
              Library Helpdesk
            </span>
          </div>

          {messages.map((message) => {
            const isUser = message.sender === "user";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isUser && (
                  <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm">
                    🤖
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] ${
                    isUser
                      ? "rounded-br-sm bg-indigo-600 text-white"
                      : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                  }`}
                >
                  {message.intent && (
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                      {message.intent}
                    </p>
                  )}

                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.text}
                  </p>

                  <p
                    className={`mt-2 text-right text-[10px] ${
                      isUser ? "text-indigo-100" : "text-slate-400"
                    }`}
                  >
                    {isUser ? "You" : "Library Assistant"}
                  </p>
                </div>

                {isUser && (
                  <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-sm">
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* Suggested questions */}
        <div className="border-t border-slate-200 bg-white px-3 pt-3 sm:px-5">
          <p className="mb-2 text-xs font-medium text-slate-500">
            Suggested questions
          </p>

          <div className="flex gap-2 overflow-x-auto pb-3">
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => sendMessage(question)}
                disabled={isTyping}
                className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-200 bg-white p-3 sm:gap-3 sm:p-5"
        >
          <label htmlFor="chat-input" className="sr-only">
            Type your library question
          </label>

          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask a library question..."
            autoComplete="off"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
          >
            <span>Send</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 2 11 13"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m22 2-7 20-4-9-9-4Z"
              />
            </svg>
          </button>
        </form>

        <footer className="bg-white pb-3 text-center text-[11px] text-slate-400">
          Library Management Helpdesk · Client-side demo
        </footer>
      </div>
    </main>
  );
}