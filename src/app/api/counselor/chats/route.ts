import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "COUNSELOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: {
      receiverId: session.user.id,
      status: "OPEN",
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          content: true,
          createdAt: true,
          isRead: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ chats });
}
