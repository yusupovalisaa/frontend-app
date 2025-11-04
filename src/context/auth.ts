import { createContext, useContext } from "react";
import { AuthContextType } from "../types/auth";

// Создаем контекст
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Создаем хук
export const useAuth = () => useContext(AuthContext);