import { useAuth as useClerkAuth } from "@clerk/nextjs";

export function useAuth() {
  const { isLoaded, userId, sessionId, getToken } = useClerkAuth();
  
  return {
    isLoaded,
    userId,
    sessionId,
    getToken
  };
}