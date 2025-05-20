// app/counselor/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Search, AlertCircle, MessageSquare, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatPreview {
  id: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    name: string | null;
    email: string | null;
  } | null;
  messages: {
    content: string;
    createdAt: string;
    isRead: boolean;
  }[];
}

export default function CounselorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Redirect if not a counselor
  useEffect(() => {
    if (status === "loading") return;
    if (session?.user.role !== "COUNSELOR") {
      router.push("/");
    }
  }, [session, status, router]);

  // Fetch assigned chats
  const fetchChats = async () => {
    try {
      const res = await fetch("/api/counselor/chats", {
        // Add cache: 'no-store' to prevent caching
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats);
      console.log("Fetched chats:", data.chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchChats();

    // Poll every 5 seconds to check for updates
    const interval = setInterval(fetchChats, 5000);

    // Add focus event listener to refetch when returning to the page
    const handleFocus = () => {
      fetchChats();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Filter chats based on search and active tab
  const filteredChats = chats?.filter((chat) => {
    // Search filter
    const senderName = chat.isAnonymous
      ? "Anonymous User"
      : chat.sender?.name || chat.sender?.email || "";
    const messageContent = chat.messages.map((m) => m.content).join(" ");
    const matchesSearch =
      searchQuery === "" ||
      senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      messageContent.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === "unread") {
      return chat.messages.some((msg) => !msg.isRead);
    } else if (activeTab === "recent") {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const lastMsgDate =
        chat.messages.length > 0
          ? new Date(chat.messages[chat.messages.length - 1].createdAt)
          : null;
      return lastMsgDate && lastMsgDate > oneDayAgo;
    }

    return true;
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full mt-4" />
        <Skeleton className="h-20 w-full mt-4" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-muted/10">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Counselor Header */}
        <div className="flex justify-between items-center pb-4 border-b w-full">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Counselor Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Welcome back, {session?.user.name || "Counselor"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback>
                {session?.user.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="all"
            className="w-full sm:w-auto"
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {chats?.some((chat) =>
                  chat.messages.some((msg) => !msg.isRead)
                ) && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  >
                    {
                      chats.filter((chat) =>
                        chat.messages.some((msg) => !msg.isRead)
                      ).length
                    }
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Chat List */}
        <div className="space-y-4 w-full">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Active Conversations
          </h2>

          {!chats && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {filteredChats?.length === 0 && (
            <div className="py-8 text-center border rounded-lg bg-muted/20 w-full">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">
                No conversations found
              </h3>
              <p className="text-muted-foreground mt-2 px-4">
                {activeTab === "all"
                  ? "You don't have any active conversations yet."
                  : activeTab === "unread"
                  ? "No unread messages in your conversations."
                  : "No recent conversations in the last 24 hours."}
              </p>
            </div>
          )}

          <div className="grid gap-3 w-full">
            {filteredChats?.map((chat) => {
              const lastMsg = chat.messages.at(-1);
              const unread = chat.messages.some((msg) => !msg.isRead);
              const unreadCount = chat.messages.filter(
                (msg) => !msg.isRead
              ).length;
              const initials = chat.isAnonymous
                ? "AN"
                : chat.sender?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") ||
                  chat.sender?.email?.substring(0, 2).toUpperCase() ||
                  "??";

              return (
                <Link
                  href={`/counselor/chat/${chat.id}`}
                  key={chat.id}
                  className="block w-full"
                >
                  <Card
                    className={`hover:shadow-md transition-all ${
                      unread ? "border-primary" : ""
                    } w-full`}
                  >
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                      <Avatar
                        className={unread ? "border-2 border-primary" : ""}
                      >
                        <AvatarFallback
                          className={
                            unread ? "bg-primary text-primary-foreground" : ""
                          }
                        >
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <p className="text-sm sm:text-md font-semibold truncate">
                            {chat.isAnonymous
                              ? "Anonymous User"
                              : chat.sender?.name || chat.sender?.email}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {unread && (
                              <Badge
                                variant="destructive"
                                className="rounded-full text-xs"
                              >
                                {unreadCount}
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {lastMsg
                                ? formatTimeAgo(lastMsg.createdAt)
                                : "New"}
                            </div>
                          </div>
                        </div>
                        <p
                          className={`text-xs sm:text-sm line-clamp-1 ${
                            unread ? "font-medium" : "text-muted-foreground"
                          }`}
                        >
                          {lastMsg?.content || "No messages yet"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
