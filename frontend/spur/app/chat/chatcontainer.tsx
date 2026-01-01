"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  AlertCircle,
  Moon,
  Sun,
  MessageSquarePlus,
  ArrowUp,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------- Types ---------------- */

interface Message {
  id: string;
  conversationId: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface ChatResponse {
  reply: string;
  sessionId: string;
}

interface ChatRequest {
  message: string;
  sessionId?: string;
}

/* ---------------- API ---------------- */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function sendMessageToAPI(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
}

/* ---------------- Theme Toggle ---------------- */

function ThemeToggle({
  isDark,
  onToggle,
}: {
  isDark: boolean;
  onToggle: () => void;
}) {
  return (
    <Button variant="ghost" size="icon" onClick={onToggle}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

/* ---------------- Message Bubble ---------------- */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";

  return (
    <div className={cn("flex mb-4", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground font-medium rounded-br-sm"
            : "bg-card text-card-foreground border border-border rounded-bl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">
          {message.text}
        </p>
        <span className="text-xs opacity-60 mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Typing Indicator ---------------- */

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150" />
          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Error ---------------- */

function ErrorMessage({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex justify-between">
        <span>{message}</span>
        {onDismiss && (
          <button onClick={onDismiss} className="underline">
            Dismiss
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/* ---------------- Input ---------------- */

function ChatInput({
  onSendMessage,
  disabled,
}: {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");

  const send = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  const onKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t bg-card/50 backdrop-blur-sm">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
      />
      <Button onClick={send} disabled={disabled} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ---------------- Message List + Scroll to Top ---------------- */

function MessageList({
  messages,
  isTyping,
}: {
  messages: Message[];
  isTyping?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex-1">
      {messages.length > 3 && (
        <Button
          size="icon"
          variant="secondary"
          onClick={scrollToTop}
          className="absolute right-4 bottom-4 z-10 rounded-full shadow-md"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      <ScrollArea ref={scrollRef} className="h-full p-4 bg-muted/30">
        {messages.map((m: any) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollArea>
    </div>
  );
}

/* ---------------- Chat Container ---------------- */

function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(
        JSON.parse(storedMessages).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }))
      );
    }

    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) setSessionId(storedSessionId);

    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const dark = storedTheme === "dark" || (!storedTheme && prefersDark);
    setIsDarkMode(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const startNewConversation = () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("sessionId");
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      conversationId: sessionId || "",
      sender: "user",
      text,
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    localStorage.setItem("chatMessages", JSON.stringify(nextMessages));
    setIsTyping(true);

    try {
      const res = await sendMessageToAPI({
        message: text,
        sessionId: sessionId || undefined,
      });

      if (res.sessionId && !sessionId) {
        setSessionId(res.sessionId);
        localStorage.setItem("sessionId", res.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversationId: res.sessionId,
        sender: "ai",
        text: res.reply,
        timestamp: new Date(),
      };

      const final = [...nextMessages, aiMessage];
      setMessages(final);
      localStorage.setItem("chatMessages", JSON.stringify(final));
    } catch {
      setError("Failed to send message.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
        <span className="font-semibold">Support Assistant</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={startNewConversation}>
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(
                "https://invigorated-flow-058766.framer.app",
                "_blank"
              )
            }
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Visit Site
            <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
          </Button>
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
        </div>
      </div>

      {error && (
        <div className="p-4">
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <MessageList messages={messages} isTyping={isTyping} />
      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </Card>
  );
}

/* ---------------- Page ---------------- */

export default ChatContainer;
