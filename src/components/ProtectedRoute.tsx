import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
};

export default ProtectedRoute;
