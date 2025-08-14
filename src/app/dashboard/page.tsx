import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  // Await auth() to correctly access userId
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard</h1>
        <p className="mb-8">
          This is a placeholder for your dashboard. We&apos;ll build the full 3D dashboard in Part 2.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Chat with SerenAI</h2>
            <p>Start a conversation with your AI companion</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Journal</h2>
            <p>Record your thoughts and feelings</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Mood Tracking</h2>
            <p>Visualize your emotional patterns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
