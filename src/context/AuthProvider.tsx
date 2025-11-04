import React, { useState, ReactNode } from "react";

import { AuthContext } from "./auth"; // Импортируйте из auth.ts
import { authApi } from "../api/authApi";
import { User } from "../types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const login = async (username: string) => {
    await authApi.login({ username });
  };

  const verify = async (username: string, token: string) => {
    const res = await authApi.verify({ username, token });
    setUser({ name: username, role: res.role || "student" });
  };

  const logout = () => setUser(null);

  const contextValue: AuthContextType = {
    user,
    login,
    verify,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};