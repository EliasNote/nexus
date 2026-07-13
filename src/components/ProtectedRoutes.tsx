import { Navigate } from "react-router-dom";
import { useCloudStore } from "../hooks/useCloudStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isTokenValid = useCloudStore((state) => state.isTokenValid);

  if (!isTokenValid) {
    return <Navigate to="/" replace />;
  }

  return children;
};
