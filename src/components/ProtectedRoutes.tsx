import { Navigate } from "react-router-dom";
import { useCloudStore } from "../hooks/useCloudStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isTokenValid = useCloudStore((state) => state.isTokenValid);
  const refreshToken = useCloudStore((state) => state.refreshToken);

  if (!isTokenValid && !refreshToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};
