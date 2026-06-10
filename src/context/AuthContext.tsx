import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserInfo } from '../types/checkin';
import { login as loginApi, logout as logoutApi, getUserInfo, isLoggedIn as checkIsLoggedIn } from '../utils/checkin';

interface ExtendedUserInfo extends UserInfo {
  studentId?: string;
  school?: string;
  token?: string;
}

interface AuthContextType {
  user: ExtendedUserInfo | null;
  isLoggedIn: () => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ExtendedUserInfo | null>(null);
  const [isLoggedInState, setIsLoggedInState] = useState(false);

  useEffect(() => {
    const currentUser = getUserInfo() as ExtendedUserInfo | null;
    if (currentUser) {
      setUser(currentUser);
      setIsLoggedInState(true);
    }
  }, []);

  const isLoggedIn = useCallback(() => {
    return isLoggedInState && !!user?.token;
  }, [isLoggedInState, user]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginApi(username, password);
    if (result.success && result.user) {
      setUser(result.user as ExtendedUserInfo);
      setIsLoggedInState(true);
    } else {
      throw new Error(result.message);
    }
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
    setIsLoggedInState(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
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
