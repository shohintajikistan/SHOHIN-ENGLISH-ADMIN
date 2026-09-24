/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   SUPABASE AUTHENTICATION

   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL =
    "https://axialbwwmablgrbqwpkc.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aWFsYnd3bWFibGdyYnF3cGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODI5MTMsImV4cCI6MjEwNTQ1ODkxM30.OZ6mkKZZxj_kGsRdD1USvumYV2PQ-5BPshnpOWBVrJs";


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

let supabaseClient = null;

let currentUser = null;


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginScreen =
    document.getElementById("login-screen");

const adminApp =
    document.getElementById("admin-app");

const loginForm =
    document.getElementById("login-form");

const loginEmail =
    document.getElementById("login-email");

const loginPassword =
    document.getElementById("login-password");

const loginButton =
    document.getElementById("login-button");

const loginButtonText =
    document.getElementById("login-button-text");

const loginError =
    document.getElementById("login-error");

const loginLoading =
    document.getElementById("login-loading");

const logoutButton =
    document.getElementById("logout-button");

const sidebarUserEmail =
    document.getElementById("sidebar-user-email");

const accountEmail =
    document.getElementById("account-email");

const accountStatus =
    document.getElementById("account-status");

const supabaseStatus =
    document.getElementById("supabase-status");

const pageTitle =
    document.getElementById("page-title");

const sidebar =
    document.getElementById("sidebar");

const sidebarToggle =
    document.getElementById("sidebar-toggle");


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "SHOHIN ENGLISH ADMIN starting..."
        );


        initializeSupabase();


        if (!supabaseClient) {

            showLoginError(
                "Supabase could not be initialized."
            );

            return;
        }


        setupEventListeners();


        await checkAuthentication();

    }
);


/* =========================================================
   INITIALIZE SUPABASE
   ========================================================= */

function initializeSupabase() {

    try {

        if (
            typeof window.supabase === "undefined"
        ) {

            console.error(
                "Supabase JS library was not loaded."
            );

            return;
        }


        if (
            typeof window.supabase.createClient !==
            "function"
        ) {

            console.error(
                "Supabase createClient is unavailable."
            );

            return;
        }


        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );


        console.log(
            "Supabase initialized."
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


    if (supabaseClient) {

        supabaseClient.auth.onAuthStateChange(
            function (event, session) {

                console.log(
                    "Auth state:",
                    event
                );


                if (
                    session &&
                    session.user
                ) {

                    currentUser =
                        session.user;

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
   CHECK AUTHENTICATION
   ========================================================= */

async function checkAuthentication() {

    if (!supabaseClient) {

        showLoginScreen();

        return;
    }


    try {

        showLoginLoading(true);


        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


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


        const session =
            data?.session;


        if (
            session &&
            session.user
        ) {

            currentUser =
                session.user;


            showAdminPanel(
                session.user
            );

        } else {

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
            "Supabase is not connected."
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

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

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
                "Login failed."
            );

            return;
        }


        currentUser =
            data.user;


        loginPassword.value = "";


        showAdminPanel(
            data.user
        );


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
            "Do you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    try {

        if (logoutButton) {

            logoutButton.disabled = true;

        }


        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );


            alert(
                getFriendlyAuthError(error)
            );


            return;
        }


        currentUser = null;


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

        if (logoutButton) {

            logoutButton.disabled = false;

        }

    }

}


/* =========================================================
   SHOW ADMIN PANEL
   ========================================================= */

function showAdminPanel(user) {

    if (!user) {
        return;
    }


    currentUser =
        user;


    if (loginScreen) {

        loginScreen.hidden = true;

        loginScreen.style.display =
            "none";

    }


    if (adminApp) {

        adminApp.hidden = false;

        adminApp.style.display =
            "";

    }


    updateUserInformation(
        user
    );


    updateSupabaseStatus(
        true
    );


    openSection(
        "dashboard"
    );


    loadDashboardStats();


    console.log(
        "Admin panel opened:",
        user.email
    );

}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLoginScreen() {

    currentUser = null;


    if (adminApp) {

        adminApp.hidden = true;

        adminApp.style.display =
            "none";

    }


    if (loginScreen) {

        loginScreen.hidden = false;

        loginScreen.style.display =
            "";

    }


    updateSupabaseStatus(
        false
    );


    if (loginEmail) {

        setTimeout(
            function () {

                loginEmail.focus();

            },
            100
        );

    }

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
   CLEAR ERROR
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

    if (loginButton) {

        loginButton.disabled =
            isLoading;

    }


    if (loginButtonText) {

        loginButtonText.textContent =
            isLoading
                ? "Signing in..."
                : "Sign In";

    }

}


/* =========================================================
   CHECKING SESSION
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
   USER INFORMATION
   ========================================================= */

function updateUserInformation(user) {

    if (!user) {
        return;
    }


    const email =
        user.email ||
        "Admin";


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
   AUTH ERROR TRANSLATION
   ========================================================= */

function getFriendlyAuthError(error) {

    if (!error) {

        return "Authentication error.";

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

        return "Your email has not been confirmed.";

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

        return "Could not connect to Supabase.";

    }


    return (
        message ||
        "Authentication failed."
    );

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
            "section-" +
            sectionName
        );


    if (target) {

        target.hidden =
            false;


        target.classList.add(
            "active"
        );

    }


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


    const titles = {

        dashboard:
            "Dashboard",

        levels:
            "Levels",

        lessons:
            "Lessons",

        vocabulary:
            "Vocabulary",

        phrases:
            "Phrases",

        exercises:
            "Exercises",

        videos:
            "Videos",

        tests:
            "Tests",

        users:
            "Users",

        settings:
            "Settings"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[sectionName] ||
            "Admin Panel";

    }


    if (
        window.innerWidth <= 900 &&
        sidebar
    ) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   SIDEBAR
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


        /* LEVELS */

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
            !levelsResult.error
        ) {

            const element =
                document.getElementById(
                    "stat-levels"
                );


            if (element) {

                element.textContent =
                    levelsResult.count || 0;

            }

        }


        /* LESSONS */

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
            !lessonsResult.error
        ) {

            const element =
                document.getElementById(
                    "stat-lessons"
                );


            if (element) {

                element.textContent =
                    lessonsResult.count || 0;

            }

        }


        /* VOCABULARY */

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
            !wordsResult.error
        ) {

            const element =
                document.getElementById(
                    "stat-words"
                );


            if (element) {

                element.textContent =
                    wordsResult.count || 0;

            }

        }


        /* PHRASES */

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
            !phrasesResult.error
        ) {

            const element =
                document.getElementById(
                    "stat-phrases"
                );


            if (element) {

                element.textContent =
                    phrasesResult.count || 0;

            }

        }


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }

}


/* =========================================================
   CURRENT USER
   ========================================================= */

function getCurrentUser() {

    return currentUser;

}


/* =========================================================
   GLOBAL ADMIN OBJECT
   ========================================================= */

window.SHOHIN_ADMIN = {

    getCurrentUser:
        getCurrentUser,

    getSupabase:
        function () {

            return supabaseClient;

        },

    logout:
        handleLogout

};