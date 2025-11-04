export type RegisterPayload = {
  role: string;
  surname: string;
  name: string;
  patronymic?: string;
};

export type LoginPayload = {
  username: string;
};

export type VerifyPayload = {
  username: string;
  token: string;
};

export type User = {
  id?: string;
  name?: string;
  role?: string;
} | null;

export interface ApiError extends Error {
  message: string;
}

export interface AuthContextType {
  user: User;
  login: (username: string) => Promise<void>;
  verify: (username: string, token: string) => Promise<void>;
  logout: () => void;
}