import { Navigate } from "react-router-dom";
import { useCloudStore } from "../hooks/useCloudStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const vault = useCloudStore((state) => state.vault);

  if (!vault) {
    return <Navigate to="/" replace />;
  }

  return children;
};
