import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "ChatId is required" }, { status: 400 });
  }

  // Get the session to check if user has access to this chat
  const session = await getServerSession(authOptions);

  // Find the chat and check permissions
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // If authenticated, verify user has access to this chat
  if (session) {
    const isParticipant =
      session.user.id === chat.senderId ||
      session.user.id === chat.receiverId ||
      session.user.role === "COUNSELOR";

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } else if (!chat.isAnonymous) {
    // Anonymous users can only access anonymous chats
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get messages
  const messages = await prisma.message.findMany({
    where: {
      chatId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      isRead: true,
      senderId: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    messages,
    chat: {
      id: chat.id,
      isAnonymous: chat.isAnonymous,
      sender: chat.sender,
    },
  });
}

export async function POST(req: Request) {
  const { chatId, content } = await req.json();
  // Removed unused senderId parameter

  if (!chatId || !content) {
    return NextResponse.json(
      { error: "ChatId and content are required" },
      { status: 400 }
    );
  }

  // Get the session to check if user is authenticated
  const session = await getServerSession(authOptions);

  // Find the chat
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  // If authenticated, verify user has access to this chat
  if (session) {
    const isParticipant =
      session.user.id === chat.senderId ||
      session.user.id === chat.receiverId ||
      session.user.role === "COUNSELOR";

    if (!isParticipant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  } else if (!chat.isAnonymous) {
    // Anonymous users can only access anonymous chats
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      chatId,
      content,
      senderId: session?.user.id || null,
      // Messages from counselors are marked as read immediately
      isRead: session?.user.role === "COUNSELOR",
    },
  });

  // Update chat timestamp
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message });
}
