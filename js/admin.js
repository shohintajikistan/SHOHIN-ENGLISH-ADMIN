/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Main Admin Controller
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   SECTION TITLES
   ========================================================= */

const sectionTitles = {

    "dashboard-section":
        "Dashboard",

    "levels-section":
        "Levels",

    "lessons-section":
        "Lessons",

    "vocabulary-section":
        "Vocabulary",

    "phrases-section":
        "Phrases",

    "videos-section":
        "Videos",

    "settings-section":
        "Settings"

};


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SHOHIN ADMIN: initialized"
        );


        initializeNavigation();

        initializeMobileMenu();

        updateDashboard();

    }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function () {

                    const sectionId =
                        item.dataset.section;


                    console.log(
                        "NAVIGATION:",
                        sectionId
                    );


                    openSection(
                        sectionId
                    );

                }
            );

        }
    );

}


/* =========================================================
   OPEN SECTION
   ========================================================= */

function openSection(
    sectionId
) {

    console.log(
        "OPEN SECTION:",
        sectionId
    );


    const sections =
        document.querySelectorAll(
            ".admin-section"
        );


    sections.forEach(
        function (section) {

            section.classList.remove(
                "active"
            );

        }
    );


    const targetSection =
        document.getElementById(
            sectionId
        );


    if (!targetSection) {

        console.error(
            "SECTION NOT FOUND:",
            sectionId
        );

        return;
    }


    targetSection.classList.add(
        "active"
    );


    /* ---------------------------------------------
       ACTIVE NAV ITEM
       --------------------------------------------- */

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        function (item) {

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


    /* ---------------------------------------------
       LEVELS
       --------------------------------------------- */

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


    /* ---------------------------------------------
       LESSONS
       --------------------------------------------- */

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


    /* ---------------------------------------------
       CLOSE MOBILE MENU
       --------------------------------------------- */

    closeMobileMenu();

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const button =
        document.getElementById(
            "mobile-menu-btn"
        );


    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );


    if (
        !button ||
        !sidebar
    ) {

        return;
    }


    button.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "admin-sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

async function updateDashboard() {

    if (
        !window.supabaseClient
    ) {

        console.error(
            "Dashboard: Supabase client missing."
        );

        return;
    }


    try {

        /* -----------------------------------------
           LEVEL COUNT
           ----------------------------------------- */

        const levelsResult =
            await window.supabaseClient
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
                    "dashboard-levels-count"
                );


            if (element) {

                element.textContent =
                    levelsResult.count || 0;

            }

        }


        /* -----------------------------------------
           LESSON COUNT
           ----------------------------------------- */

        const lessonsResult =
            await window.supabaseClient
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
                    "dashboard-lessons-count"
                );


            if (element) {

                element.textContent =
                    lessonsResult.count || 0;

            }

        }


        /* -----------------------------------------
           CONNECTION
           ----------------------------------------- */

        const connectionText =
            document.getElementById(
                "dashboard-connection-text"
            );


        if (connectionText) {

            connectionText.textContent =
                "Supabase connected successfully.";

        }


        console.log(
            "SHOHIN ADMIN: dashboard loaded"
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        const connectionText =
            document.getElementById(
                "dashboard-connection-text"
            );


        if (connectionText) {

            connectionText.textContent =
                "Supabase connection error.";

        }

    }

}


/* =========================================================
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "admin-message"
        );


    if (!element) {

        console.log(
            message
        );

        return;
    }


    element.textContent =
        message;


    element.className =
        "admin-message " +
        type;


    element.style.display =
        "block";


    setTimeout(
        function () {

            element.style.display =
                "none";

        },
        3000
    );

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.openSection =
    openSection;

window.updateDashboard =
    updateDashboard;

window.showAdminMessage =
    showAdminMessage;