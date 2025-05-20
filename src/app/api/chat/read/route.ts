import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "COUNSELOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json(
        { error: "ChatId is required" },
        { status: 400 }
      );
    }

    // Mark all messages in this chat as read
    // For anonymous users, messages have null senderId
    const result = await prisma.message.updateMany({
      where: {
        chatId,
        isRead: false,
        // Don't mark messages from the counselor as read
        senderId: null,
      },
      data: {
        isRead: true,
      },
    });

    console.log(`Marked ${result.count} messages as read in chat ${chatId}`);

    return NextResponse.json({
      success: true,
      messagesUpdated: result.count,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
