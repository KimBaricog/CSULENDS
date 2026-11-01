import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const INTERVAL_MS = 60000;

// Tells the database "this student is here" about once a minute while the tab is open.
// The admin dashboard uses it to show who is online.
export default function useHeartbeat() {
  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        supabase.rpc("touch_last_seen").then(
          () => {},
          () => {},
        );
      }
    };

    beat();
    const timer = setInterval(beat, INTERVAL_MS);
    document.addEventListener("visibilitychange", beat);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", beat);
    };
  }, []);
}
