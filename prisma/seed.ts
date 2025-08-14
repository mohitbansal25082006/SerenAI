import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a sample user
  const user = await prisma.user.upsert({
    where: { clerkId: 'sample_user_id' },
    update: {},
    create: {
      clerkId: 'sample_user_id',
      email: 'sample@example.com',
      name: 'Sample User',
    },
  });

  // Create sample conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'First Conversation',
    },
  });

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        role: 'user',
        content: 'Hello, I need someone to talk to.',
      },
      {
        conversationId: conversation1.id,
        role: 'assistant',
        content: "I'm here for you. What's on your mind today?",
      },
    ],
  });

  // Create sample journal entries
  await prisma.journalEntry.createMany({
    data: [
      {
        userId: user.id,
        title: 'Gratitude Journal',
        content: 'Today I am grateful for my family and health.',
        mood: 8.5,
        tags: ['gratitude', 'family'],
      },
      {
        userId: user.id,
        title: 'Challenging Day',
        content: 'Work was stressful today, but I managed to stay calm.',
        mood: 6.0,
        tags: ['stress', 'work'],
      },
    ],
  });

  // Create sample mood records
  await prisma.moodRecord.createMany({
    data: [
      { userId: user.id, mood: 7.5, note: 'Feeling good today' },
      { userId: user.id, mood: 8.0, note: 'Great day with friends' },
      { userId: user.id, mood: 5.5, note: 'A bit tired' },
    ],
  });

  // Create sample sessions
  await prisma.session.createMany({
    data: [
      { userId: user.id, type: 'chat', duration: 300 },
      { userId: user.id, type: 'journal', duration: 600 },
      { userId: user.id, type: 'mood', duration: 120 },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });