/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Supabase connection
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

const SUPABASE_URL =
    "https://axialbwwmablgrbawpckc.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZXMiLCJyZWYiOiJheGlhbGJ3d21hYmxncmJhd3BrYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzg5ODgyOTEzLCJleHAiOjIxMDU0NTg5MTN9.OZ6mkKZZxj_kGsRdD1USvumYV2PQ-5BPshnpOWBVrJs";

if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
) {
    console.error("Supabase library was not loaded.");
    throw new Error("Supabase library was not loaded.");
}

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

window.supabaseClient = supabaseClient;

console.log("SHOHIN ENGLISH ADMIN: Supabase connected.");