import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import useHeartbeat from "../hooks/useHeartbeat";
import { installGlobalErrorLogging } from "../lib/logError";
import "./style/applayout.css";

// Wraps every page a logged-in student sees.
// Adds the bottom navigation on phones, the "online" heartbeat, and error reporting.
export default function AppLayout() {
  useHeartbeat();
  useEffect(() => installGlobalErrorLogging(), []);

  return (
    <div className="applayout">
      <Outlet />
      <BottomNav />
    </div>
  );
}
