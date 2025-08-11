interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER" | "READ_ONLY";
  createdAt: string;
}

export const isAdmin = (user: User | null | undefined): boolean => {
  return user?.role === "ADMIN";
};

export const canViewAllUsers = (user: User | null | undefined): boolean => {
  return isAdmin(user);
};

export const canModifyUser = (
  currentUser: User | null | undefined,
  targetUserId?: string
): boolean => {
  if (!currentUser) return false;

  // Admin can modify any user
  if (isAdmin(currentUser)) return true;

  // Users can only modify themselves
  return currentUser.id === targetUserId;
};

export const canViewUserAnalytics = (
  currentUser: User | null | undefined,
  targetUserId?: string
): boolean => {
  if (!currentUser) return false;

  // Admin can view any user's analytics
  if (isAdmin(currentUser)) return true;

  // Users can only view their own analytics
  return currentUser.id === targetUserId;
};
