import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nupnpoxrrqjuqzeuqsgm.supabase.co";
const supabaseKey = "sb_publishable_6UosbW8KDmaG8i1QrlLmLA_L74eK9mz";

export const supabase = createClient(supabaseUrl, supabaseKey);
