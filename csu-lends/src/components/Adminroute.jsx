import { Navigate, Outlet } from "react-router-dom";
import useProfile from "../hooks/Useprofile";

export default function AdminRoute() {
  const { profile, loading } = useProfile();

  if (loading) return <p>Loading...</p>;

  return profile?.is_admin ? <Outlet /> : <Navigate to="/browse" replace />;
}
