import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  const isAnonymous = !session;

  let chat;

  if (session) {
    chat = await prisma.chat.findFirst({
      where: {
        senderId: session.user.id,
        status: "OPEN",
      },
    });
  }

  if (!chat) {
    // Find a counselor (can be enhanced with load balancing later)
    const counselor = await prisma.user.findFirst({
      where: { role: "COUNSELOR" },
    });

    chat = await prisma.chat.create({
      data: {
        senderId: session?.user.id ?? null,
        receiverId: counselor?.id ?? null,
        isAnonymous,
      },
    });
  }
  console.log(chat.id);
  return NextResponse.json({ chatId: chat.id });
}
