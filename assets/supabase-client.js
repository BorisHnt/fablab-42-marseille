import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./supabase-config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
