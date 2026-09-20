/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   js/admin.js

   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuItems = document.querySelectorAll(".menu-item");
    const sections = document.querySelectorAll(".section");
    const pageTitle = document.getElementById("page-title");

    const mobileMenu = document.querySelector(".mobile-menu");
    const sidebar = document.querySelector(".sidebar");


    /* =====================================================
       SECTION TITLES
       ===================================================== */

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


    /* =====================================================
       OPEN SECTION
       ===================================================== */

    function openSection(sectionId) {

        sections.forEach(section => {
            section.classList.remove("active");
        });

        menuItems.forEach(item => {
            item.classList.remove("active");
        });


        const targetSection =
            document.getElementById(sectionId);

        const targetMenu =
            document.querySelector(
                `.menu-item[data-section="${sectionId}"]`
            );


        if (targetSection) {
            targetSection.classList.add("active");
        }

        if (targetMenu) {
            targetMenu.classList.add("active");
        }


        if (pageTitle) {
            pageTitle.textContent =
                sectionTitles[sectionId] || "Dashboard";
        }


        /* Close mobile sidebar */

        if (window.innerWidth <= 700) {
            sidebar.classList.remove("open");
        }


        /* Save current section */

        localStorage.setItem(
            "shohin_admin_section",
            sectionId
        );
    }


    /* =====================================================
       MENU CLICK
       ===================================================== */

    menuItems.forEach(item => {

        item.addEventListener("click", () => {

            const sectionId =
                item.dataset.section;

            openSection(sectionId);

        });

    });


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    if (mobileMenu) {

        mobileMenu.addEventListener("click", () => {

            sidebar.classList.toggle("open");

        });

    }


    /* =====================================================
       CLOSE SIDEBAR WHEN CLICKING OUTSIDE
       ===================================================== */

    document.addEventListener("click", event => {

        if (window.innerWidth > 700) {
            return;
        }

        const clickedInsideSidebar =
            sidebar.contains(event.target);

        const clickedMenuButton =
            mobileMenu &&
            mobileMenu.contains(event.target);

        if (
            !clickedInsideSidebar &&
            !clickedMenuButton
        ) {
            sidebar.classList.remove("open");
        }

    });


    /* =====================================================
       RESTORE LAST SECTION
       ===================================================== */

    const savedSection =
        localStorage.getItem(
            "shohin_admin_section"
        );

    if (
        savedSection &&
        document.getElementById(savedSection)
    ) {

        openSection(savedSection);

    } else {

        openSection("dashboard");

    }


    /* =====================================================
       INITIAL DASHBOARD DATA
       ===================================================== */

    updateDashboard();


    /* =====================================================
       DASHBOARD COUNTERS
       ===================================================== */

    function updateDashboard() {

        const levels =
            JSON.parse(
                localStorage.getItem(
                    "shohin_admin_levels"
                ) || "[]"
            );

        const lessons =
            JSON.parse(
                localStorage.getItem(
                    "shohin_admin_lessons"
                ) || "[]"
            );

        const words =
            JSON.parse(
                localStorage.getItem(
                    "shohin_admin_words"
                ) || "[]"
            );

        const phrases =
            JSON.parse(
                localStorage.getItem(
                    "shohin_admin_phrases"
                ) || "[]"
            );


        const levelsCount =
            document.getElementById(
                "levels-count"
            );

        const lessonsCount =
            document.getElementById(
                "lessons-count"
            );

        const wordsCount =
            document.getElementById(
                "words-count"
            );

        const phrasesCount =
            document.getElementById(
                "phrases-count"
            );


        if (levelsCount) {
            levelsCount.textContent =
                levels.length;
        }

        if (lessonsCount) {
            lessonsCount.textContent =
                lessons.length;
        }

        if (wordsCount) {
            wordsCount.textContent =
                words.length;
        }

        if (phrasesCount) {
            phrasesCount.textContent =
                phrases.length;
        }

    }


    /* =====================================================
       GLOBAL ADMIN API
       Future modules can use this.
       ===================================================== */

    window.SHOHIN_ADMIN = {

        openSection,

        updateDashboard,

        getData(key) {

            return JSON.parse(
                localStorage.getItem(key) || "[]"
            );

        },

        saveData(key, data) {

            localStorage.setItem(
                key,
                JSON.stringify(data)
            );

            updateDashboard();

        }

    };


});