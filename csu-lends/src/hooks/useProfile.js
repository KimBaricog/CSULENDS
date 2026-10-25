import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

// Returns the signed-in student's row from the profiles table (includes is_admin).
export default function useProfile() {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = session?.user?.id;

  useEffect(() => {
    if (sessionLoading) return;

    if (!userId) {
      setProfile(null);
      setLoading(false);
      console.log("No logged-in user");
      return;
    }

    let active = true;

    const fetchProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, program, is_admin")
        .eq("id", userId)
        .maybeSingle();

      console.log("Logged-in user ID:", userId);
      console.log("Fetched profile:", data);
      console.log("Profile query error:", error);

      if (active) {
        setProfile(data);
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [userId, sessionLoading]);

  return { profile, loading: sessionLoading || loading };
}
