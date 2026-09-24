/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   SUPABASE AUTHENTICATION

   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ

   IMPORTANT:
   1. Replace SUPABASE_URL
   2. Replace SUPABASE_ANON_KEY
   3. NEVER put service_role key here
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

let supabaseClient = null;


/* =========================================================
   APP STATE
   ========================================================= */

let currentUser = null;


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const loginScreen = document.getElementById("login-screen");

const adminApp = document.getElementById("admin-app");

const loginForm = document.getElementById("login-form");

const loginEmail = document.getElementById("login-email");

const loginPassword = document.getElementById("login-password");

const loginButton = document.getElementById("login-button");

const loginButtonText = document.getElementById("login-button-text");

const loginError = document.getElementById("login-error");

const loginLoading = document.getElementById("login-loading");

const logoutButton = document.getElementById("logout-button");

const sidebarUserEmail = document.getElementById("sidebar-user-email");

const accountEmail = document.getElementById("account-email");

const accountStatus = document.getElementById("account-status");

const supabaseStatus = document.getElementById("supabase-status");

const pageTitle = document.getElementById("page-title");

const sidebar = document.getElementById("sidebar");

const sidebarToggle = document.getElementById("sidebar-toggle");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("SHOHIN ENGLISH ADMIN starting...");

    initializeSupabase();

    if (!supabaseClient) {
        showLoginError(
            "Supabase configuration is missing. Add your Supabase URL and anon key in js/admin.js."
        );

        return;
    }

    setupEventListeners();

    await checkAuthentication();

});


/* =========================================================
   INITIALIZE SUPABASE
   ========================================================= */

function initializeSupabase() {

    try {

        if (
            SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL" ||
            SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY"
        ) {

            console.error(
                "Supabase URL or anon key has not been configured."
            );

            return;
        }


        if (
            typeof window.supabase === "undefined" ||
            typeof window.supabase.createClient !== "function"
        ) {

            console.error(
                "Supabase library was not loaded."
            );

            return;
        }


        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


        console.log(
            "Supabase initialized successfully."
        );


    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

    }

}


/* =========================================================
   EVENT LISTENERS
   ========================================================= */

function setupEventListeners() {

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            handleLogout
        );

    }


    if (sidebarToggle) {

        sidebarToggle.addEventListener(
            "click",
            toggleSidebar
        );

    }


    /*
     * Supabase authentication state listener
     */

    if (supabaseClient) {

        supabaseClient.auth.onAuthStateChange(
            async function (event, session) {

                console.log(
                    "Auth event:",
                    event
                );


                if (session && session.user) {

                    currentUser = session.user;

                    showAdminPanel(
                        session.user
                    );

                } else {

                    currentUser = null;

                    showLoginScreen();

                }

            }
        );

    }

}


/* =========================================================
   CHECK CURRENT AUTHENTICATION
   ========================================================= */

async function checkAuthentication() {

    if (!supabaseClient) {
        return;
    }


    try {

        showLoginLoading(true);


        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            showLoginError(
                getFriendlyAuthError(error)
            );

            showLoginScreen();

            return;
        }


        const session = data ? data.session : null;


        if (
            session &&
            session.user
        ) {

            console.log(
                "Existing session found."
            );

            currentUser = session.user;

            showAdminPanel(
                session.user
            );

        } else {

            console.log(
                "No active session."
            );

            showLoginScreen();

        }


    } catch (error) {

        console.error(
            "Authentication check error:",
            error
        );

        showLoginError(
            getFriendlyAuthError(error)
        );

        showLoginScreen();

    } finally {

        showLoginLoading(false);

    }

}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(event) {

    event.preventDefault();


    if (!supabaseClient) {

        showLoginError(
            "Supabase is not configured."
        );

        return;
    }


    const email =
        loginEmail.value.trim();


    const password =
        loginPassword.value;


    if (!email) {

        showLoginError(
            "Please enter your email."
        );

        return;
    }


    if (!password) {

        showLoginError(
            "Please enter your password."
        );

        return;
    }


    setLoginLoading(true);

    clearLoginError();


    try {

        console.log(
            "Signing in..."
        );


        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


        if (error) {

            console.error(
                "Login error:",
                error
            );

            showLoginError(
                getFriendlyAuthError(error)
            );

            return;
        }


        if (
            !data ||
            !data.user
        ) {

            showLoginError(
                "Login failed. User session was not created."
            );

            return;
        }


        console.log(
            "Login successful."
        );


        currentUser =
            data.user;


        showAdminPanel(
            data.user
        );


        loginPassword.value = "";


    } catch (error) {

        console.error(
            "Login exception:",
            error
        );

        showLoginError(
            getFriendlyAuthError(error)
        );

    } finally {

        setLoginLoading(false);

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function handleLogout() {

    if (!supabaseClient) {
        return;
    }


    const confirmed =
        window.confirm(
            "Do you want to logout from SHOHIN ENGLISH Admin?"
        );


    if (!confirmed) {
        return;
    }


    try {

        console.log(
            "Signing out..."
        );


        logoutButton.disabled = true;


        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                getFriendlyAuthError(error)
            );


            logoutButton.disabled = false;

            return;
        }


        currentUser = null;


        console.log(
            "Logout successful."
        );


        showLoginScreen();


    } catch (error) {

        console.error(
            "Logout exception:",
            error
        );


        alert(
            getFriendlyAuthError(error)
        );


    } finally {

        logoutButton.disabled = false;

    }

}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

function showAdminPanel(user) {

    if (!user) {
        return;
    }


    currentUser = user;


    if (loginScreen) {

        loginScreen.hidden = true;

        loginScreen.style.display = "none";

    }


    if (adminApp) {

        adminApp.hidden = false;

        adminApp.style.display = "";

    }


    updateUserInformation(
        user
    );


    updateSupabaseStatus(
        true
    );


    /*
     * Start with Dashboard
     */

    openSection(
        "dashboard"
    );


    /*
     * Load dashboard statistics
     */

    loadDashboardStats();


    console.log(
        "Admin panel opened for:",
        user.email
    );

}


/* =========================================================
   SHOW LOGIN SCREEN
   ========================================================= */

function showLoginScreen() {

    currentUser = null;


    if (adminApp) {

        adminApp.hidden = true;

        adminApp.style.display = "none";

    }


    if (loginScreen) {

        loginScreen.hidden = false;

        loginScreen.style.display = "";

    }


    updateSupabaseStatus(
        false
    );


    if (loginEmail) {

        loginEmail.focus();

    }


    console.log(
        "Login screen displayed."
    );

}


/* =========================================================
   LOGIN ERROR
   ========================================================= */

function showLoginError(message) {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        message;


    loginError.hidden =
        false;


    loginError.style.display =
        "block";

}


/* =========================================================
   CLEAR LOGIN ERROR
   ========================================================= */

function clearLoginError() {

    if (!loginError) {
        return;
    }


    loginError.textContent =
        "";


    loginError.hidden =
        true;


    loginError.style.display =
        "none";

}


/* =========================================================
   LOGIN LOADING
   ========================================================= */

function setLoginLoading(isLoading) {

    if (!loginButton) {
        return;
    }


    loginButton.disabled =
        isLoading;


    if (loginButtonText) {

        loginButtonText.textContent =
            isLoading
                ? "Signing in..."
                : "Sign In";

    }

}


/* =========================================================
   AUTH CHECK LOADING
   ========================================================= */

function showLoginLoading(show) {

    if (!loginLoading) {
        return;
    }


    loginLoading.hidden =
        !show;


    loginLoading.style.display =
        show
            ? "block"
            : "none";

}


/* =========================================================
   UPDATE USER INFORMATION
   ========================================================= */

function updateUserInformation(user) {

    if (!user) {
        return;
    }


    const email =
        user.email || "Admin";


    if (sidebarUserEmail) {

        sidebarUserEmail.textContent =
            email;

    }


    if (accountEmail) {

        accountEmail.textContent =
            email;

    }


    if (accountStatus) {

        accountStatus.textContent =
            "Authenticated";

    }

}


/* =========================================================
   SUPABASE STATUS
   ========================================================= */

function updateSupabaseStatus(isConnected) {

    if (!supabaseStatus) {
        return;
    }


    if (isConnected) {

        supabaseStatus.textContent =
            "● Connected";


        supabaseStatus.classList.add(
            "connected"
        );


        supabaseStatus.classList.remove(
            "offline"
        );


    } else {

        supabaseStatus.textContent =
            "● Offline";


        supabaseStatus.classList.add(
            "offline"
        );


        supabaseStatus.classList.remove(
            "connected"
        );

    }

}


/* =========================================================
   FRIENDLY AUTH ERRORS
   ========================================================= */

function getFriendlyAuthError(error) {

    if (!error) {

        return "An unknown authentication error occurred.";

    }


    const message =
        String(
            error.message || ""
        );


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "invalid login credentials"
        )
    ) {

        return "Incorrect email or password.";

    }


    if (
        lower.includes(
            "email not confirmed"
        )
    ) {

        return "Your email has not been confirmed in Supabase.";

    }


    if (
        lower.includes(
            "user not found"
        )
    ) {

        return "Admin account was not found.";

    }


    if (
        lower.includes(
            "invalid api key"
        )
    ) {

        return "Supabase API key is incorrect.";

    }


    if (
        lower.includes(
            "failed to fetch"
        )
    ) {

        return "Could not connect to Supabase. Check your internet connection and Supabase URL.";

    }


    return message ||
        "Authentication failed.";

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function openSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    sections.forEach(
        function (section) {

            section.classList.remove(
                "active"
            );


            section.hidden =
                true;

        }
    );


    const target =
        document.getElementById(
            "section-" + sectionName
        );


    if (target) {

        target.hidden =
            false;


        target.classList.add(
            "active"
        );

    }


    /*
     * Navigation buttons
     */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.classList.remove(
                "active"
            );

        }
    );


    const activeNav =
        document.querySelector(
            '.nav-item[data-section="' +
            sectionName +
            '"]'
        );


    if (activeNav) {

        activeNav.classList.add(
            "active"
        );

    }


    /*
     * Page title
     */

    const titles = {

        dashboard: "Dashboard",

        levels: "Levels",

        lessons: "Lessons",

        vocabulary: "Vocabulary",

        phrases: "Phrases",

        exercises: "Exercises",

        videos: "Videos",

        tests: "Tests",

        users: "Users",

        settings: "Settings"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionName] ||
            "Admin Panel";

    }


    /*
     * Close mobile sidebar
     */

    if (window.innerWidth <= 900) {

        if (sidebar) {

            sidebar.classList.remove(
                "open"
            );

        }

    }

}


/* =========================================================
   SIDEBAR TOGGLE
   ========================================================= */

function toggleSidebar() {

    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

async function loadDashboardStats() {

    if (!supabaseClient) {
        return;
    }


    try {

        /*
         * LEVELS
         */

        const levelsResult =
            await supabaseClient
                .from("levels")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (
            !levelsResult.error &&
            document.getElementById("stat-levels")
        ) {

            document.getElementById(
                "stat-levels"
            ).textContent =
                levelsResult.count || 0;

        }


        /*
         * LESSONS
         */

        const lessonsResult =
            await supabaseClient
                .from("lessons")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (
            !lessonsResult.error &&
            document.getElementById("stat-lessons")
        ) {

            document.getElementById(
                "stat-lessons"
            ).textContent =
                lessonsResult.count || 0;

        }


        /*
         * VOCABULARY
         *
         * If your table has another name,
         * change "vocabulary" later.
         */

        const wordsResult =
            await supabaseClient
                .from("vocabulary")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (
            !wordsResult.error &&
            document.getElementById("stat-words")
        ) {

            document.getElementById(
                "stat-words"
            ).textContent =
                wordsResult.count || 0;

        }


        /*
         * PHRASES
         */

        const phrasesResult =
            await supabaseClient
                .from("phrases")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (
            !phrasesResult.error &&
            document.getElementById("stat-phrases")
        ) {

            document.getElementById(
                "stat-phrases"
            ).textContent =
                phrasesResult.count || 0;

        }


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}


/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "Global error:",
            event.error || event.message
        );

    }
);


/* =========================================================
   AUTH SESSION PROTECTION
   ========================================================= */

async function requireAdminSession() {

    if (!supabaseClient) {

        showLoginScreen();

        return false;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (
            error ||
            !data ||
            !data.session ||
            !data.session.user
        ) {

            showLoginScreen();

            return false;

        }


        currentUser =
            data.session.user;


        return true;


    } catch (error) {

        console.error(
            "Session protection error:",
            error
        );


        showLoginScreen();

        return false;

    }

}


/* =========================================================
   DEBUG HELPER
   ========================================================= */

window.SHOHIN_ADMIN = {

    getCurrentUser: function () {

        return currentUser;

    },


    getSupabase: function () {

        return supabaseClient;

    },


    logout: async function () {

        await handleLogout();

    }

};