import { Navigate, Outlet } from "react-router-dom";
import useSession from "../hooks/useSession";

// Wrap any page that needs a logged-in student.
// Visitors who are not logged in are sent to /login.
export default function ProtectedRoute() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />;
}
