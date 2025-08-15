import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const user1 = await prisma.user.upsert({
    where: { clerkId: 'sample_user_id' },
    update: {},
    create: {
      clerkId: 'sample_user_id',
      email: 'sample@example.com',
      name: 'Sample User',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { clerkId: 'user2' },
    update: {},
    create: {
      clerkId: 'user2',
      email: 'alex@example.com',
      name: 'Alex Chen',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { clerkId: 'user3' },
    update: {},
    create: {
      clerkId: 'user3',
      email: 'michael@example.com',
      name: 'Michael Torres',
    },
  });

  // Create sample conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: user1.id,
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
        userId: user1.id,
        title: 'Gratitude Journal',
        content: 'Today I am grateful for my family and health.',
        mood: 8.5,
        tags: ['gratitude', 'family'],
      },
      {
        userId: user1.id,
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
      { userId: user1.id, mood: 7.5, note: 'Feeling good today' },
      { userId: user1.id, mood: 8.0, note: 'Great day with friends' },
      { userId: user1.id, mood: 5.5, note: 'A bit tired' },
    ],
  });

  // Create sample sessions
  await prisma.session.createMany({
    data: [
      { userId: user1.id, type: 'chat', duration: 300 },
      { userId: user1.id, type: 'journal', duration: 600 },
      { userId: user1.id, type: 'mood', duration: 120 },
    ],
  });

  // Create sample posts
  const posts = [
    {
      userId: user1.id,
      title: "How has SerenAI helped you in your mental wellness journey?",
      content: "I wanted to start a discussion about how SerenAI has positively impacted people's mental health. For me, it's been a game-changer in helping me track my mood patterns and understand my emotions better.",
      category: "general",
      tags: ["personal-experience", "mental-health"],
      isPinned: true,
    },
    {
      userId: user2.id,
      title: "Feature Request: Dark Mode for Journal Entries",
      content: "I would love to see a dark mode option for the journal entries. The bright white background can be harsh on the eyes, especially when writing at night. Has anyone else found this to be an issue?",
      category: "features",
      tags: ["feature-request", "ui", "dark-mode"],
      isSolved: true,
    },
    {
      userId: user3.id,
      title: "Tips for new users getting started with SerenAI",
      content: "I thought I'd share some tips that helped me when I first started using SerenAI. These might be helpful for others who are just beginning their mental wellness journey with the app.",
      category: "support",
      tags: ["tips", "getting-started", "beginners"],
      isPinned: true,
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    });
  }

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