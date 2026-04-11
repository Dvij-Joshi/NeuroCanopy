import { createClient } from '@supabase/supabase-js';

// Use standard vite environment typing workaround if ts-ignore is needed temporarily
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing! Using placeholder connection.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZWl0aGJ5ZWJ5bGtwdXF0ZmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDI4ODAsImV4cCI6MjA4NzAxODg4MH0.UIxmoKiWxiU97jiu710LC9mMAHSzbyzo01JeG8Ho5l0'
);
