// prisma/seed.ts
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Counselor
  const counselor = await prisma.user.create({
    data: {
      name: "Counselor One",
      email: "counselor@peertalk.com",
      password: await hash("counselor123", 10),
      role: "COUNSELOR",
    },
  });

  // 2. Registered user
  const user1 = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      password: await hash("user123", 10),
    },
  });

  // 3. Anonymous chat
  const chatAnon = await prisma.chat.create({
    data: {
      isAnonymous: true,
      receiverId: counselor.id,
      messages: {
        create: [
          {
            content: "Hi, I need help anonymously.",
            isRead: false,
          },
        ],
      },
    },
  });

  // 4. Registered chat
  const chatUser1 = await prisma.chat.create({
    data: {
      senderId: user1.id,
      receiverId: counselor.id,
      isAnonymous: false,
      messages: {
        create: [
          {
            content: "Hi, I'm John.",
            senderId: user1.id,
            isRead: false,
          },
          {
            content: "Hello John, how can I assist?",
            senderId: counselor.id,
            isRead: true,
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
