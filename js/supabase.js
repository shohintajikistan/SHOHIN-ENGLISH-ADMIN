/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Supabase Connection
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

const SUPABASE_URL =
    "https://axialbwwmablgrbqwpkc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_OrW3SgmDmSmVN2QxtrCh6g_NoQga0Ug";


/* =========================================================
   CHECK SUPABASE LIBRARY
   ========================================================= */

if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
) {

    console.error(
        "Supabase library was not loaded."
    );

    throw new Error(
        "Supabase library was not loaded."
    );

}


/* =========================================================
   CREATE CLIENT
   ========================================================= */

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


/* =========================================================
   GLOBAL CLIENT
   ========================================================= */

window.supabaseClient =
    supabaseClient;


console.log(
    "SHOHIN ENGLISH ADMIN: Supabase connected."
);