import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pcxfmtflzlufvnnrcntw.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeGZtdGZsemx1ZnZubnJjbnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MDY4OTAsImV4cCI6MjA5MTQ4Mjg5MH0.ln2Ry0JiMACakQOuYDv-pjj5OpkBeoQtSIVS-5E7djs";
export const supabase = createClient(supabaseUrl, supabaseKey);
