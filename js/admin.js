/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   Supabase connection
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

// =========================================================
// SUPABASE SETTINGS
// =========================================================

const SUPABASE_URL = "https://axialbwwmablgrbqwpkc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aWFsYnd3bWFibGdyYnF3cGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODI5MTMsImV4cCI6MjEwNTQ1ODkxM30.OZ6mkKZZxj_kGsRdD1USvumYV2PQ-5BPshnpOWBVrJs";

// =========================================================
// SUPABASE CLIENT
// =========================================================

let supabaseClient = null;

function initializeSupabase() {
  if (typeof window.supabase === "undefined") {
    console.error(
      "Supabase library не загружена. Проверь index.html."
    );
    return false;
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error("Supabase URL или Publishable Key отсутствует.");
    return false;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  console.log("SHOHIN ENGLISH — Supabase initialized.");

  return true;
}

// =========================================================
// ADMIN PANEL NAVIGATION
// =========================================================

const sectionTitles = {
  dashboard: "Dashboard",
  levels: "Levels",
  lessons: "Lessons",
  vocabulary: "Vocabulary",
  phrases: "Phrases",
  exercises: "Exercises",
  videos: "Videos",
  tests: "Tests"
};

function openSection(sectionName) {
  const sections = document.querySelectorAll(".admin-section");

  sections.forEach((section) => {
    section.classList.remove("active");
  });

  const target = document.getElementById(
    `section-${sectionName}`
  );

  if (target) {
    target.classList.add("active");
  }

  const title = document.getElementById("page-title");

  if (title) {
    title.textContent =
      sectionTitles[sectionName] || "SHOHIN ENGLISH";
  }

  localStorage.setItem(
    "shohin_admin_last_section",
    sectionName
  );

  updateDashboard();
}

// =========================================================
// MOBILE SIDEBAR
// =========================================================

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}

// =========================================================
// LOCAL DATA
// =========================================================

function getData(key) {
  try {
    return JSON.parse(
      localStorage.getItem(key) || "[]"
    );
  } catch (error) {
    console.error("Local data error:", error);
    return [];
  }
}

function saveData(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify(data)
  );

  updateDashboard();
}

// =========================================================
// DASHBOARD
// =========================================================

function updateDashboard() {
  const levels = getData("shohin_admin_levels");
  const lessons = getData("shohin_admin_lessons");
  const words = getData("shohin_admin_words");
  const phrases = getData("shohin_admin_phrases");

  const levelCount = document.getElementById("stat-levels");
  const lessonCount = document.getElementById("stat-lessons");
  const wordCount = document.getElementById("stat-words");
  const phraseCount = document.getElementById("stat-phrases");

  if (levelCount) {
    levelCount.textContent = levels.length;
  }

  if (lessonCount) {
    lessonCount.textContent = lessons.length;
  }

  if (wordCount) {
    wordCount.textContent = words.length;
  }

  if (phraseCount) {
    phraseCount.textContent = phrases.length;
  }
}

// =========================================================
// TEST SUPABASE CONNECTION
// =========================================================

async function testSupabaseConnection() {
  if (!supabaseClient) {
    console.warn("Supabase client не подключён.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("levels")
      .select("*")
      .order("sort_order");

    if (error) {
      console.error(
        "Supabase connection error:",
        error
      );
      return;
    }

    console.log(
      "✅ SHOHIN ENGLISH — Supabase connected!"
    );

    console.log(
      "Levels from Supabase:",
      data
    );

  } catch (error) {
    console.error(
      "Supabase request failed:",
      error
    );
  }
}

// =========================================================
// LOAD LEVELS
// =========================================================

async function loadLevelsFromSupabase() {
  if (!supabaseClient) {
    console.warn("Supabase client не подключён.");
    return [];
  }

  const { data, error } =
    await supabaseClient
      .from("levels")
      .select("*")
      .order("sort_order");

  if (error) {
    console.error(
      "Cannot load levels:",
      error
    );

    return [];
  }

  return data || [];
}

// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initializeSupabase();

    const savedSection =
      localStorage.getItem(
        "shohin_admin_last_section"
      ) || "dashboard";

    openSection(savedSection);

    updateDashboard();

    await testSupabaseConnection();

  }
);

// =========================================================
// GLOBAL ADMIN API
// =========================================================

window.SHOHIN_ADMIN = {

  openSection,
  toggleSidebar,
  updateDashboard,
  getData,
  saveData,
  testSupabaseConnection,
  loadLevelsFromSupabase,

  getSupabaseClient: () => {
    return supabaseClient;
  }

};