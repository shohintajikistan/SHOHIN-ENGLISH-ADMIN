/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   Main Admin Controller
   Navigation + Dashboard + Mobile Menu
   Supabase connection comes from supabase.js

   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   SECTION TITLES
   ========================================================= */

const sectionTitles = {

    "dashboard-section": "Dashboard",

    "levels-section": "Levels",

    "lessons-section": "Lessons",

    "vocabulary-section": "Vocabulary",

    "phrases-section": "Phrases",

    "videos-section": "Videos",

    "settings-section": "Settings"

};


/* =========================================================
   GET SECTION NAME
   ========================================================= */

function getSectionName(sectionId) {

    return sectionTitles[sectionId] || "SHOHIN ENGLISH";

}


/* =========================================================
   OPEN SECTION
   ========================================================= */

function openSection(sectionId) {

    console.log(
        "Opening admin section:",
        sectionId
    );


    /* -----------------------------------------
       Hide all sections
       ----------------------------------------- */

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    sections.forEach(
        (section) => {

            section.classList.remove(
                "active"
            );

        }
    );


    /* -----------------------------------------
       Show requested section
       ----------------------------------------- */

    const target =
        document.getElementById(
            sectionId
        );


    if (!target) {

        console.error(
            "Admin section not found:",
            sectionId
        );

        return;

    }


    target.classList.add(
        "active"
    );


    /* -----------------------------------------
       Update page title
       ----------------------------------------- */

    const pageTitle =
        document.getElementById(
            "page-title"
        );


    if (pageTitle) {

        pageTitle.textContent =
            getSectionName(
                sectionId
            );

    }


    /* -----------------------------------------
       Update navigation buttons
       ----------------------------------------- */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        (item) => {

            item.classList.remove(
                "active"
            );


            if (
                item.dataset.section ===
                sectionId
            ) {

                item.classList.add(
                    "active"
                );

            }

        }
    );


    /* -----------------------------------------
       Save last opened section
       ----------------------------------------- */

    localStorage.setItem(
        "shohin_admin_last_section",
        sectionId
    );


    /* -----------------------------------------
       Section-specific initialization
       ----------------------------------------- */

    if (
        sectionId ===
        "levels-section"
    ) {

        if (
            typeof window.loadLevels ===
            "function"
        ) {

            window.loadLevels();

        }

    }


    if (
        sectionId ===
        "lessons-section"
    ) {

        if (
            typeof window.initializeLessons ===
            "function"
        ) {

            window.initializeLessons();

        }

    }


    /* -----------------------------------------
       Close mobile sidebar
       ----------------------------------------- */

    closeMobileSidebar();

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );


    if (!sidebar) {
        return;
    }


    sidebar.classList.toggle(
        "open"
    );

}


/* =========================================================
   CLOSE MOBILE SIDEBAR
   ========================================================= */

function closeMobileSidebar() {

    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );


    if (!sidebar) {
        return;
    }


    if (
        window.innerWidth <= 900
    ) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

async function updateDashboard() {

    const client =
        window.supabaseClient;


    if (!client) {

        console.warn(
            "Supabase client is not available."
        );

        return;

    }


    try {

        /* -------------------------------------
           Levels count
           ------------------------------------- */

        const levelsResult =
            await client
                .from("levels")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        /* -------------------------------------
           Lessons count
           ------------------------------------- */

        const lessonsResult =
            await client
                .from("lessons")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        /* -------------------------------------
           Dashboard elements
           ------------------------------------- */

        const levelsCount =
            document.getElementById(
                "dashboard-levels-count"
            );


        const lessonsCount =
            document.getElementById(
                "dashboard-lessons-count"
            );


        if (levelsCount) {

            levelsCount.textContent =
                levelsResult.error
                    ? "0"
                    : (
                        levelsResult.count ||
                        0
                    );

        }


        if (lessonsCount) {

            lessonsCount.textContent =
                lessonsResult.error
                    ? "0"
                    : (
                        lessonsResult.count ||
                        0
                    );

        }


        if (levelsResult.error) {

            console.error(
                "Dashboard levels error:",
                levelsResult.error
            );

        }


        if (lessonsResult.error) {

            console.error(
                "Dashboard lessons error:",
                lessonsResult.error
            );

        }


        /* -------------------------------------
           Vocabulary / Videos
           Currently static
           ------------------------------------- */

        console.log(
            "Dashboard updated."
        );

    } catch (error) {

        console.error(
            "Dashboard update error:",
            error
        );

    }

}


/* =========================================================
   SUPABASE CONNECTION STATUS
   ========================================================= */

async function testSupabaseConnection() {

    const client =
        window.supabaseClient;


    const status =
        document.getElementById(
            "supabase-status"
        );


    const connectionText =
        document.getElementById(
            "dashboard-connection-text"
        );


    const dot =
        document.getElementById(
            "connection-dot"
        );


    if (!client) {

        updateConnectionUI(
            false,
            "Supabase not connected",
            status,
            connectionText,
            dot
        );


        return false;

    }


    try {

        const {
            error
        } = await client
            .from("levels")
            .select("id")
            .limit(1);


        if (error) {

            console.error(
                "Supabase connection error:",
                error
            );


            updateConnectionUI(
                false,
                "Connection error",
                status,
                connectionText,
                dot
            );


            return false;

        }


        console.log(
            "SHOHIN ENGLISH — Supabase connected."
        );


        updateConnectionUI(
            true,
            "Connected",
            status,
            connectionText,
            dot
        );


        return true;

    } catch (error) {

        console.error(
            "Supabase test failed:",
            error
        );


        updateConnectionUI(
            false,
            "Connection error",
            status,
            connectionText,
            dot
        );


        return false;

    }

}


/* =========================================================
   CONNECTION UI
   ========================================================= */

function updateConnectionUI(
    connected,
    message,
    status,
    connectionText,
    dot
) {

    if (status) {

        status.textContent =
            message;

        status.classList.remove(
            "success",
            "error"
        );

        status.classList.add(
            connected
                ? "success"
                : "error"
        );

    }


    if (connectionText) {

        connectionText.textContent =
            connected
                ? "Supabase connection is active."
                : message;

    }


    if (dot) {

        dot.classList.remove(
            "success",
            "error"
        );

        dot.classList.add(
            connected
                ? "success"
                : "error"
        );

    }

}


/* =========================================================
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(
    message,
    type = "info"
) {

    console.log(
        `[${type}]`,
        message
    );


    /*
     * Simple fallback.
     * Later we can replace this with
     * a professional toast notification.
     */

    if (
        type === "error"
    ) {

        alert(
            message
        );

    }

}


/* =========================================================
   NAVIGATION INITIALIZATION
   ========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        (item) => {

            item.addEventListener(
                "click",
                function () {

                    const sectionId =
                        this.dataset.section;


                    if (!sectionId) {

                        console.warn(
                            "Navigation item has no data-section."
                        );

                        return;

                    }


                    openSection(
                        sectionId
                    );

                }
            );

        }
    );


    console.log(
        "Admin navigation initialized."
    );

}


/* =========================================================
   MOBILE MENU INITIALIZATION
   ========================================================= */

function initializeMobileMenu() {

    const button =
        document.getElementById(
            "mobile-menu-btn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            toggleSidebar();

        }
    );

}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function initializeGlobalClicks() {

    document.addEventListener(
        "click",
        function (event) {

            /*
             * Nothing here for now.
             * Reserved for future admin controls.
             */

        }
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "SHOHIN ENGLISH ADMIN — initializing..."
        );


        /* -------------------------------------
           Navigation
           ------------------------------------- */

        initializeNavigation();


        /* -------------------------------------
           Mobile menu
           ------------------------------------- */

        initializeMobileMenu();


        /* -------------------------------------
           Global clicks
           ------------------------------------- */

        initializeGlobalClicks();


        /* -------------------------------------
           Supabase connection
           ------------------------------------- */

        await testSupabaseConnection();


        /* -------------------------------------
           Dashboard
           ------------------------------------- */

        await updateDashboard();


        /* -------------------------------------
           Restore last section
           ------------------------------------- */

        const savedSection =
            localStorage.getItem(
                "shohin_admin_last_section"
            );


        const validSections = [
            "dashboard-section",
            "levels-section",
            "lessons-section",
            "vocabulary-section",
            "phrases-section",
            "videos-section",
            "settings-section"
        ];


        const sectionToOpen =
            validSections.includes(
                savedSection
            )
                ? savedSection
                : "dashboard-section";


        openSection(
            sectionToOpen
        );


        console.log(
            "SHOHIN ENGLISH ADMIN — ready."
        );

    }
);


/* =========================================================
   GLOBAL API
   ========================================================= */

window.openSection =
    openSection;


window.toggleSidebar =
    toggleSidebar;


window.closeMobileSidebar =
    closeMobileSidebar;


window.updateDashboard =
    updateDashboard;


window.testSupabaseConnection =
    testSupabaseConnection;


window.showAdminMessage =
    showAdminMessage;


window.escapeHtml =
    escapeHtml;


/* =========================================================
   SHOHIN ADMIN API
   ========================================================= */

window.SHOHIN_ADMIN = {

    openSection,

    toggleSidebar,

    closeMobileSidebar,

    updateDashboard,

    testSupabaseConnection,

    showAdminMessage,

    escapeHtml

};