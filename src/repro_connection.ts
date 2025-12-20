import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tpqjbmpxmhuqrribtist.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcWpibXB4bWh1cXJyaWJ0aXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTI2NDQsImV4cCI6MjA2OTg4ODY0NH0.e5hvxtbxrpCHioWYvMzpL3aXMe-D29wrzOWJZevnZsM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testConnection() {
  console.log("Testing Supabase connection...");
  try {
    // Check if we can reach the auth server
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Connection Error:", error.message);
    } else {
      console.log("Connection to Auth Server: OK");
    }

    // Try a sign in to see if we get a valid response from the backend
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: "test@test.com",
      password: "wrongpassword"
    });

    if (signInError) {
      console.log("Sign In Response:", signInError.message);
      if (signInError.message === "Invalid login credentials") {
        console.log("SUCCESS: Supabase is reachable and responding correctly.");
      } else {
        console.log("WARNING: Supabase responded but with an unexpected error.");
      }
    }

  } catch (err) {
    console.error("Script Error:", err);
  }
}

testConnection();
