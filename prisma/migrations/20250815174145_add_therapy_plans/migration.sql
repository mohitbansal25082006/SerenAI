-- CreateTable
CREATE TABLE "public"."therapy_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "goals" TEXT[],
    "activities" TEXT[],
    "resources" TEXT[],
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapy_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."therapy_sessions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "mood" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "therapy_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."therapy_plans" ADD CONSTRAINT "therapy_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."therapy_sessions" ADD CONSTRAINT "therapy_sessions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."therapy_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
