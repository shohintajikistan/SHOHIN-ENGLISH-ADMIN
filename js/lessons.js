/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   LESSONS MANAGEMENT
   Supabase + Lessons CRUD
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

let adminLessonLevels = [];
let currentLessons = [];
let selectedLessonLevelId = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    console.log("LESSONS: initializing...");
    loadLessonLevels();
});


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLessonLevels() {

    const select = document.getElementById("lesson-level-select");

    if (!select) {
        console.error("LESSONS: level select not found.");
        return;
    }

    try {

        const { data, error } = await supabaseClient
            .from("levels")
            .select("id, code, name, sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("LESSONS: levels error:", error);

            select.innerHTML =
                '<option value="">Error loading levels</option>';

            return;
        }

        adminLessonLevels = data || [];

        select.innerHTML =
            '<option value="">Select level</option>';

        adminLessonLevels.forEach(function (level) {

            const option = document.createElement("option");

            option.value = String(level.id);

            option.textContent =
                level.code + " — " + level.name;

            select.appendChild(option);
        });

        select.addEventListener("change", function () {

            const value = this.value;

            if (!value) {

                selectedLessonLevelId = null;
                currentLessons = [];

                renderLessons();

                return;
            }

            selectedLessonLevelId = Number(value);

            console.log(
                "LESSONS: selected level ID:",
                selectedLessonLevelId
            );

            loadLessons(selectedLessonLevelId);
        });

    } catch (error) {

        console.error(
            "LESSONS: unexpected levels error:",
            error
        );
    }
}


/* =========================================================
   LOAD LESSONS
   ========================================================= */

async function loadLessons(levelId) {

    const list = document.getElementById("lessons-list");

    if (!list) return;

    list.innerHTML =
        '<div class="loading">Loading lessons...</div>';

    try {

        const { data, error } = await supabaseClient
            .from("lessons")
            .select("*")
            .eq("level_id", Number(levelId))
            .order("sort_order", { ascending: true });

        if (error) {

            console.error("LESSONS: load error:", error);

            list.innerHTML =
                '<div class="empty-state">' +
                '<strong>Error loading lessons</strong><br>' +
                escapeLessonHtml(error.message) +
                '</div>';

            return;
        }

        currentLessons = data || [];

        renderLessons();

    } catch (error) {

        console.error(
            "LESSONS: unexpected load error:",
            error
        );

        list.innerHTML =
            '<div class="empty-state">' +
            '<strong>Error</strong><br>' +
            escapeLessonHtml(error.message) +
            '</div>';
    }
}


/* =========================================================
   RENDER LESSONS
   ========================================================= */

function renderLessons() {

    const list = document.getElementById("lessons-list");

    if (!list) return;

    if (!currentLessons.length) {

        list.innerHTML =
            '<div class="empty-state">' +
            '<strong>No lessons yet</strong><br>' +
            'Click "+ Add Lesson" to create the first lesson.' +
            '</div>';

        return;
    }

    list.innerHTML = "";

    currentLessons.forEach(function (lesson, index) {

        const item = document.createElement("div");

        item.className = "admin-list-item";

        const number =
            Number(lesson.sort_order) || index + 1;

        const description =
            lesson.description || "No description";

        item.innerHTML =
            '<div class="admin-list-main">' +

                '<div class="admin-list-number">' +
                    number +
                '</div>' +

                '<div>' +

                    '<h3>' +
                        escapeLessonHtml(lesson.title) +
                    '</h3>' +

                    '<p>' +
                        escapeLessonHtml(description) +
                    '</p>' +

                '</div>' +

            '</div>' +

            '<div class="admin-list-actions">' +

                '<button ' +
                    'type="button" ' +
                    'class="btn btn-secondary btn-sm" ' +
                    'onclick="openEditLessonModal(' +
                        lesson.id +
                    ')">' +
                    'Edit' +
                '</button>' +

                '<button ' +
                    'type="button" ' +
                    'class="btn btn-danger btn-sm" ' +
                    'onclick="deleteLesson(' +
                        lesson.id +
                    ')">' +
                    'Delete' +
                '</button>' +

            '</div>';

        list.appendChild(item);
    });
}


/* =========================================================
   OPEN ADD LESSON MODAL
   ========================================================= */

function openAddLessonModal() {

    console.log(
        "LESSONS: opening Add Lesson."
    );

    if (!selectedLessonLevelId) {

        showAdminMessage(
            "Please select a level first.",
            "warning"
        );

        return;
    }

    const modal =
        document.getElementById("add-lesson-modal");

    if (!modal) {

        showAdminMessage(
            "Add Lesson window was not found.",
            "error"
        );

        return;
    }

    const titleInput =
        document.getElementById("lesson-title-input");

    const descriptionInput =
        document.getElementById(
            "lesson-description-input"
        );

    const sortInput =
        document.getElementById(
            "lesson-sort-order-input"
        );

    if (titleInput) {
        titleInput.value = "";
    }

    if (descriptionInput) {
        descriptionInput.value = "";
    }

    if (sortInput) {
        sortInput.value =
            getNextLessonSortOrder();
    }

    const selectedLevel =
        adminLessonLevels.find(function (level) {
            return Number(level.id) ===
                Number(selectedLessonLevelId);
        });

    const selectedLevelBox =
        document.getElementById(
            "add-lesson-selected-level"
        );

    if (selectedLevelBox && selectedLevel) {

        selectedLevelBox.textContent =
            selectedLevel.code +
            " — " +
            selectedLevel.name;
    }

    modal.classList.add("active");
    modal.style.display = "flex";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    if (titleInput) {
        setTimeout(function () {
            titleInput.focus();
        }, 100);
    }
}


/* =========================================================
   CLOSE ADD LESSON
   ========================================================= */

function closeAddLessonModal() {

    const modal =
        document.getElementById("add-lesson-modal");

    if (!modal) return;

    modal.classList.remove("active");

    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   NEXT SORT ORDER
   ========================================================= */

function getNextLessonSortOrder() {

    if (!currentLessons.length) {
        return 1;
    }

    const numbers =
        currentLessons.map(function (lesson) {

            return Number(
                lesson.sort_order
            ) || 0;

        });

    return Math.max(...numbers) + 1;
}


/* =========================================================
   ADD LESSON
   ========================================================= */

async function addLesson() {

    console.log(
        "LESSONS: addLesson() started."
    );

    console.log(
        "LESSONS: selectedLessonLevelId =",
        selectedLessonLevelId
    );

    if (!selectedLessonLevelId) {

        showAdminMessage(
            "Please select a level first.",
            "warning"
        );

        return;
    }

    const titleInput =
        document.getElementById(
            "lesson-title-input"
        );

    const descriptionInput =
        document.getElementById(
            "lesson-description-input"
        );

    const sortInput =
        document.getElementById(
            "lesson-sort-order-input"
        );

    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    let sortOrder =
        sortInput
            ? Number(sortInput.value)
            : getNextLessonSortOrder();

    if (!Number.isFinite(sortOrder) || sortOrder < 1) {
        sortOrder = getNextLessonSortOrder();
    }

    if (!title) {

        showAdminMessage(
            "Lesson title is required.",
            "warning"
        );

        if (titleInput) {
            titleInput.focus();
        }

        return;
    }

    const lessonData = {
        level_id: Number(selectedLessonLevelId),
        title: title,
        description: description || null,
        sort_order: sortOrder
    };

    console.log(
        "LESSONS: sending to Supabase:",
        lessonData
    );

    try {

        const { data, error } =
            await supabaseClient
                .from("lessons")
                .insert(lessonData)
                .select()
                .single();

        if (error) {

            console.error(
                "LESSONS: SUPABASE INSERT ERROR:",
                error
            );

            showAdminMessage(
                "Could not add lesson: " +
                error.message,
                "error"
            );

            return;
        }

        console.log(
            "LESSONS: lesson added successfully:",
            data
        );

        closeAddLessonModal();

        showAdminMessage(
            "Lesson added successfully.",
            "success"
        );

        await loadLessons(
            selectedLessonLevelId
        );

        if (typeof updateDashboard === "function") {
            updateDashboard();
        }

    } catch (error) {

        console.error(
            "LESSONS: unexpected add error:",
            error
        );

        showAdminMessage(
            "Unexpected error: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   OPEN EDIT LESSON
   ========================================================= */

function openEditLessonModal(lessonId) {

    const lesson =
        currentLessons.find(function (item) {

            return Number(item.id) ===
                Number(lessonId);

        });

    if (!lesson) {

        showAdminMessage(
            "Lesson not found.",
            "error"
        );

        return;
    }

    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );

    if (!modal) return;

    const idInput =
        document.getElementById(
            "edit-lesson-id"
        );

    const titleInput =
        document.getElementById(
            "edit-lesson-title"
        );

    const descriptionInput =
        document.getElementById(
            "edit-lesson-description"
        );

    const sortInput =
        document.getElementById(
            "edit-lesson-sort-order"
        );

    if (idInput) {
        idInput.value = lesson.id;
    }

    if (titleInput) {
        titleInput.value = lesson.title || "";
    }

    if (descriptionInput) {
        descriptionInput.value =
            lesson.description || "";
    }

    if (sortInput) {
        sortInput.value =
            lesson.sort_order || 1;
    }

    modal.classList.add("active");
    modal.style.display = "flex";
    modal.style.visibility = "visible";
    modal.style.opacity = "1";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}


/* =========================================================
   CLOSE EDIT LESSON
   ========================================================= */

function closeEditLessonModal() {

    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );

    if (!modal) return;

    modal.classList.remove("active");

    modal.style.display = "none";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   UPDATE LESSON
   ========================================================= */

async function updateLesson() {

    const idInput =
        document.getElementById(
            "edit-lesson-id"
        );

    const titleInput =
        document.getElementById(
            "edit-lesson-title"
        );

    const descriptionInput =
        document.getElementById(
            "edit-lesson-description"
        );

    const sortInput =
        document.getElementById(
            "edit-lesson-sort-order"
        );

    const lessonId =
        idInput
            ? Number(idInput.value)
            : null;

    const title =
        titleInput
            ? titleInput.value.trim()
            : "";

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    const sortOrder =
        sortInput
            ? Number(sortInput.value)
            : 1;

    if (!lessonId) {

        showAdminMessage(
            "Lesson ID is missing.",
            "error"
        );

        return;
    }

    if (!title) {

        showAdminMessage(
            "Lesson title is required.",
            "warning"
        );

        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("lessons")
                .update({
                    title: title,
                    description: description || null,
                    sort_order: sortOrder
                })
                .eq("id", lessonId)
                .select()
                .single();

        if (error) {

            console.error(
                "LESSONS: update error:",
                error
            );

            showAdminMessage(
                "Could not update lesson: " +
                error.message,
                "error"
            );

            return;
        }

        closeEditLessonModal();

        showAdminMessage(
            "Lesson updated successfully.",
            "success"
        );

        await loadLessons(
            selectedLessonLevelId
        );

        if (typeof updateDashboard === "function") {
            updateDashboard();
        }

    } catch (error) {

        console.error(
            "LESSONS: unexpected update error:",
            error
        );

        showAdminMessage(
            "Unexpected error: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(lessonId) {

    const lesson =
        currentLessons.find(function (item) {

            return Number(item.id) ===
                Number(lessonId);

        });

    const lessonName =
        lesson
            ? lesson.title
            : "this lesson";

    if (!window.confirm(
        'Delete "' + lessonName + '"?'
    )) {
        return;
    }

    try {

        const { error } =
            await supabaseClient
                .from("lessons")
                .delete()
                .eq("id", lessonId);

        if (error) {

            console.error(
                "LESSONS: delete error:",
                error
            );

            showAdminMessage(
                "Could not delete lesson: " +
                error.message,
                "error"
            );

            return;
        }

        showAdminMessage(
            "Lesson deleted successfully.",
            "success"
        );

        await loadLessons(
            selectedLessonLevelId
        );

        if (typeof updateDashboard === "function") {
            updateDashboard();
        }

    } catch (error) {

        console.error(
            "LESSONS: unexpected delete error:",
            error
        );

        showAdminMessage(
            "Unexpected error: " +
            error.message,
            "error"
        );
    }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeLessonHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   CLOSE MODALS
   ========================================================= */

document.addEventListener("click", function (event) {

    const addModal =
        document.getElementById("add-lesson-modal");

    const editModal =
        document.getElementById("edit-lesson-modal");

    if (
        addModal &&
        event.target === addModal
    ) {
        closeAddLessonModal();
    }

    if (
        editModal &&
        event.target === editModal
    ) {
        closeEditLessonModal();
    }
});


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener("keydown", function (event) {

    if (event.key !== "Escape") {
        return;
    }

    closeAddLessonModal();
    closeEditLessonModal();
});


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadLessonLevels = loadLessonLevels;
window.loadLessons = loadLessons;
window.openAddLessonModal = openAddLessonModal;
window.closeAddLessonModal = closeAddLessonModal;
window.addLesson = addLesson;
window.openEditLessonModal = openEditLessonModal;
window.closeEditLessonModal = closeEditLessonModal;
window.updateLesson = updateLesson;
window.deleteLesson = deleteLesson;


/* =========================================================
   END
   ========================================================= */
