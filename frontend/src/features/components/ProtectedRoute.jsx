import { Navigate } from "react-router";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
