"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Send, Home } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);

  // Start or fetch chat
  useEffect(() => {
    const startChat = async () => {
      try {
        setLoading(true);
        // Check if user is logged in
        if (session) {
          // Fetch existing chat ID for logged-in users
          console.log("Fetching chat for user:", session.user.id);
          const response = await fetch("/api/chat/start", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: session.user.id }),
          });
          const data = await response.json();
          setChatId(data.chatId);
        } else {
          // Start a new anonymous chat
          const storedChatId = localStorage.getItem("anonymousChatId");
          if (storedChatId) {
            setChatId(storedChatId);
          } else {
            const response = await fetch("/api/chat/start", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ isAnonymous: true }),
            });
            const data = await response.json();
            setChatId(data.chatId);
            localStorage.setItem("anonymousChatId", data.chatId);
          }
        }
      } catch (error) {
        console.error("Error starting chat:", error);
      } finally {
        setLoading(false);
      }
    };

    startChat();
  }, [session]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
        const data = await res.json();
        setMessages(data.messages);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // Send message with proper sender identification
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !chatId) return;

    try {
      // For anonymous users, ensure the senderId is null
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          content: input,
          // Only send user ID if logged in
          senderId: session?.user?.id || null,
        }),
      });

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Key improvement: Helper function to determine if a message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    if (session) {
      // For logged in users, compare senderId with session id
      return message.senderId === session.user.id;
    } else {
      // For anonymous users, treat null senderId messages as theirs
      // and messages with senderId as coming from the counselor
      return message.senderId === null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-3xl mx-auto w-full h-full flex flex-col p-3 md:p-6">
        {/* Chat container with shadow */}
        <div className="flex flex-col h-full rounded-xl border shadow-lg overflow-hidden bg-card">
          {/* Chat header - now sticky */}
          <div className="sticky top-0 z-10 p-4 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="p-1 rounded-full hover:bg-muted transition-colors mr-1"
                title="Kembali ke Beranda"
              >
                <Home className="h-5 w-5" />
              </Link>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h2 className="font-semibold">Obrolan dengan Konselor</h2>
                <p className="text-xs text-muted-foreground">
                  {session ? "Masuk" : "Anonim"} · {messages.length} pesan
                </p>
              </div>
            </div>
            {loading && (
              <div className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                Menghubungkan...
              </div>
            )}
          </div>

          {/* Chat messages - with better scrolling */}
          <div className="flex-1 overflow-y-auto p-4 bg-background/40">
            <div className="space-y-4 px-1">
              {loading && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-center text-sm text-muted-foreground">
                    Memulai obrolan...
                  </p>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="bg-muted/20 rounded-lg p-6 text-center my-8 border border-dashed border-muted">
                  <Send className="h-8 w-8 mx-auto opacity-50 mb-2" />
                  <p className="text-muted-foreground">
                    Kirim pesan untuk memulai percakapan.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    isCurrentUserMessage(message)
                      ? "justify-end"
                      : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-1 duration-300`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                      isCurrentUserMessage(message)
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    }`}
                  >
                    <div className="flex items-end gap-2">
                      <p className="flex-1 break-words">{message.content}</p>
                      <p className="text-[10px] opacity-60 whitespace-nowrap self-end pt-1">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message input */}
          <form
            onSubmit={sendMessage}
            className="p-3 border-t bg-background/80 backdrop-blur-sm flex gap-2 items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan Anda..."
              className="flex-1 bg-background/60 border-muted focus-visible:ring-primary/50"
              disabled={loading || !chatId}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-9 w-9 transition-all duration-200 hover:bg-primary/90"
              disabled={loading || !chatId || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
