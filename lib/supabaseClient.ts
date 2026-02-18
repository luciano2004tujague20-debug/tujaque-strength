import { createClient } from '@supabase/supabase-js';

// PEGÁ TUS DATOS REALES ACÁ ENTRE LAS COMILLAS
const supabaseUrl = "https://tiziowezshcdkzxabjso.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpemlvd2V6c2hjZGt6eGFianNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MjE0NDUsImV4cCI6MjA4NjM5NzQ0NX0.Kh1qvGI840OsgmEYvQvci9gTykiGxisXnyh9DssD1mM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);