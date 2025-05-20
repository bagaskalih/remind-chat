"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  senderId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function CounselorChatPage() {
  const { id } = useParams();
  const chatId = Array.isArray(id) ? id[0] : id;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [senderInfo, setSenderInfo] = useState({
    isAnonymous: true,
    name: "Pengguna Anonim",
    initials: "AN",
  });

  // Redirect if not a counselor
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user.role !== "COUNSELOR") {
      router.push("/");
    }
  }, [session, status, router]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages and mark as read
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?chatId=${chatId}`);
        if (!res.ok) throw new Error("Failed to fetch messages");

        const data = await res.json();
        setMessages(data.messages);

        // Update sender info if available
        if (data.chat) {
          const isAnon = data.chat.isAnonymous;
          const sender = data.chat.sender;
          if (!isAnon && sender) {
            const name = sender.name || sender.email || "Pengguna";
            const initials = name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase();

            setSenderInfo({
              isAnonymous: false,
              name,
              initials,
            });
          }
        }

        scrollToBottom();

        // Mark messages as read - only if we have actual messages
        if (data.messages.length > 0) {
          await fetch("/api/chat/read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ chatId }),
          });
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    return () => clearInterval(interval);
  }, [chatId]);

  // Send message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input || !chatId) return;

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          content: input,
          senderId: session?.user?.id ?? null,
        }),
      });

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-2">
      {/* Chat header */}
      <div className="p-4 border-b bg-card flex items-center gap-3">
        <Link href="/counselor/dashboard" className="hover:opacity-70">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar>
          <AvatarFallback>{senderInfo.initials}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{senderInfo.name}</h2>
          <p className="text-xs text-muted-foreground">
            {messages.length} pesan
          </p>
        </div>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === session?.user?.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.senderId === session?.user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs opacity-70 text-right mt-1">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {message.senderId !== session?.user?.id && (
                    <span className="ml-2">{message.isRead ? "✓" : ""}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t bg-background flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan Anda..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
