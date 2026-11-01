import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Gives you { [studentId]: { full_name, program, member_since, email_verified,
// items_shared, loans_as_lender, loans_as_borrower } } for the ids you pass in.
// It loads quietly: if it fails, the page simply shows less detail.
export default function useStudentSummaries(ids) {
  const [summaries, setSummaries] = useState({});
  const key = [...new Set(ids.filter(Boolean))].sort().join(",");

  useEffect(() => {
    if (!key) return undefined;
    let active = true;

    supabase.rpc("student_summaries", { uids: key.split(",") }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Could not load student details:", error);
        return;
      }
      setSummaries((current) => {
        const next = { ...current };
        (data || []).forEach((row) => {
          next[row.id] = row;
        });
        return next;
      });
    });

    return () => {
      active = false;
    };
  }, [key]);

  return summaries;
}
