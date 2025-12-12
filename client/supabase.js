import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ocdobxhwgyjlwmdunyvz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZG9ieGh3Z3lqbHdtZHVueXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTgyOTYsImV4cCI6MjA3NzMzNDI5Nn0.sdNcHrUtgTBPh_q2dgDhbtTVTxuxeMO3KhQXe9APU1g";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
