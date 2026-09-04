/**
 * Custom hook for managing authentication state and actions.
 */

import { useStore } from '@/store/store';

export function useAuth() {
  const { user, isAuthenticated, isPartner, isLoading, isBootstrapping, login, logout, setUser, refreshUser } = useStore();

  return {
    user,
    isAuthenticated,
    isPartner,
    isLoading,
    isBootstrapping,
    login,
    logout,
    setUser,
    refreshUser,
  };
}

export default useAuth;
