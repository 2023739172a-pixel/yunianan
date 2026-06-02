import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserInfo, AuthContextType } from '../types/checkin';
import { login, logout, getUserInfo, isLoggedIn } from '../utils/checkin';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const currentUser = getUserInfo();
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedInState(true);
    }
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    const result = await login(username, password);
    if (result.success && result.user) {
      setUser(result.user);
      setIsLoggedInState(true);
    } else {
      throw new Error(result.message);
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setIsLoggedInState(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: isLoggedInState, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
