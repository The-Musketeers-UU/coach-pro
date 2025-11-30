"use client";

import { getCurrentUser } from "@/lib/auth/auth-service";
import type { FullUser } from "@/lib/auth/auth-service";
import { useEffect, useState } from "react";

export function ProfileBox() {
  const [currentUser, setCurrentUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { user } = await getCurrentUser();
      if (user) setCurrentUser(user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="mt-4 h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center p-4 text-gray-500">
        No user logged in.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg">
          {/* Add avatar here when available */}
        </div>

        {currentUser.profile.isCoach && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            COACH
          </div>
        )}
      </div>

      <h3 className="mt-4 text-xl font-bold text-gray-800">
        {currentUser.profile.name}
      </h3>

      <p className="text-sm text-gray-600">
        {currentUser.profile.email}
      </p>
    </div>
  );
}
