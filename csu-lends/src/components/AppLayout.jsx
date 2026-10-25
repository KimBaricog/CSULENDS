import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import "./style/applayout.css";

// Wraps every page a logged-in student sees. Adds the bottom navigation on phones.
export default function AppLayout() {
  return (
    <div className="applayout">
      <Outlet />
      <BottomNav />
    </div>
  );
}
