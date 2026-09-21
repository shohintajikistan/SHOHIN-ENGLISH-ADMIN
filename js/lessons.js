/* =========================================================
   SHOHIN ENGLISH — ADMIN
   LESSONS MANAGEMENT
   Supabase
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLevels = [];
let currentLessons = [];
let selectedLessonLevelId = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("SHOHIN ENGLISH — Lessons loaded.");

    await loadLessonLevels();

});


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLessonLevels() {

    const select =
        document.getElementById("lesson-level-select");

    if (!select) {
        console.warn("lesson-level-select not found.");
        return;
    }


    try {

        const { data, error } =
            await supabaseClient
                .from("levels")
                .select("*")
                .order("sort_order", {
                    ascending: true
                });


        if (error) {

            console.error(
                "Error loading levels:",
                error
            );

            select.innerHTML =
                `<option value="">
                    Error loading levels
                </option>`;

            return;
        }


        adminLevels = data || [];


        select.innerHTML =
            `<option value="">
                Select a level...
            </option>`;


        adminLevels.forEach(level => {

            const option =
                document.createElement("option");


            option.value = level.id;


            option.textContent =
                `${level.code} — ${level.name}`;


            select.appendChild(option);

        });


        /*
         * When user selects A1, A2, B1...
         */

        select.onchange = async function () {

            selectedLessonLevelId =
                this.value
                    ? Number(this.value)
                    : null;


            if (!selectedLessonLevelId) {

                currentLessons = [];


                document.getElementById(
                    "lessons-list"
                ).innerHTML =
                    `<div class="empty-state">
                        Select a level to see lessons.
                    </div>`;

                return;
            }


            await loadLessons(
                selectedLessonLevelId
            );

        };


    } catch (error) {

        console.error(
            "Unexpected error loading levels:",
            error
        );

    }

}


/* =========================================================
   LOAD LESSONS
   ========================================================= */

async function loadLessons(levelId) {

    const container =
        document.getElementById("lessons-list");


    if (!container) {
        return;
    }


    container.innerHTML =
        `<div class="empty-state">
            Loading lessons...
        </div>`;


    try {

        const { data, error } =
            await supabaseClient
                .from("lessons")
                .select("*")
                .eq("level_id", levelId)
                .order("sort_order", {
                    ascending: true
                });


        if (error) {

            console.error(
                "Error loading lessons:",
                error
            );


            container.innerHTML =
                `<div class="empty-state">
                    Failed to load lessons.<br>
                    ${escapeLessonHTML(error.message)}
                </div>`;


            return;
        }


        currentLessons = data || [];


        renderLessons();


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        container.innerHTML =
            `<div class="empty-state">
                Unexpected error.
            </div>`;

    }

}


/* =========================================================
   RENDER LESSONS
   ========================================================= */

function renderLessons() {

    const container =
        document.getElementById("lessons-list");


    if (!container) {
        return;
    }


    if (currentLessons.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                No lessons yet.<br>
                Click <strong>+ Add Lesson</strong>
                to create the first lesson.
            </div>`;

        return;
    }


    container.innerHTML = "";


    currentLessons.forEach(
        (lesson, index) => {

            const item =
                document.createElement("div");


            item.className =
                "admin-list-item";


            const title =
                escapeLessonHTML(
                    lesson.title ||
                    `Lesson ${index + 1}`
                );


            const description =
                escapeLessonHTML(
                    lesson.description || ""
                );


            const sortOrder =
                Number(lesson.sort_order) ||
                index + 1;


            item.innerHTML = `

                <div class="admin-list-main">

                    <div class="admin-list-number">
                        ${sortOrder}
                    </div>

                    <div>

                        <h3>
                            ${title}
                        </h3>

                        ${
                            description
                                ? `<p>${description}</p>`
                                : ""
                        }

                    </div>

                </div>


                <div class="admin-list-actions">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="openEditLessonModal(${lesson.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteLesson(${lesson.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


/* =========================================================
   OPEN ADD LESSON MODAL
   ========================================================= */

function openAddLessonModal() {

    if (!selectedLessonLevelId) {

        showAdminMessage(
            "Please select a level first.",
            "warning"
        );

        return;
    }


    const modal =
        document.getElementById(
            "add-lesson-modal"
        );


    const titleInput =
        document.getElementById(
            "lesson-title-input"
        );


    const descriptionInput =
        document.getElementById(
            "lesson-description-input"
        );


    const orderInput =
        document.getElementById(
            "lesson-sort-order-input"
        );


    if (!modal) {
        return;
    }


    titleInput.value = "";

    descriptionInput.value = "";


    const nextOrder =
        currentLessons.length + 1;


    orderInput.value =
        nextOrder;


    modal.style.display =
        "flex";

}


/* =========================================================
   CLOSE ADD LESSON MODAL
   ========================================================= */

function closeAddLessonModal() {

    const modal =
        document.getElementById(
            "add-lesson-modal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   ADD LESSON
   ========================================================= */

async function addLesson() {

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


    const orderInput =
        document.getElementById(
            "lesson-sort-order-input"
        );


    const title =
        titleInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const sortOrder =
        Number(orderInput.value);


    if (!title) {

        showAdminMessage(
            "Please enter a lesson title.",
            "warning"
        );

        titleInput.focus();

        return;
    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 1
    ) {

        showAdminMessage(
            "Sort Order must be 1 or higher.",
            "warning"
        );

        orderInput.focus();

        return;
    }


    try {

        const { data, error } =
            await supabaseClient
                .from("lessons")
                .insert([
                    {
                        level_id:
                            selectedLessonLevelId,

                        title:
                            title,

                        description:
                            description || null,

                        sort_order:
                            sortOrder
                    }
                ])
                .select()
                .single();


        if (error) {

            console.error(
                "Error adding lesson:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        currentLessons.push(data);


        currentLessons.sort(
            (a, b) =>
                Number(a.sort_order) -
                Number(b.sort_order)
        );


        renderLessons();


        closeAddLessonModal();


        showAdminMessage(
            "Lesson added successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while adding lesson.",
            "error"
        );

    }

}


/* =========================================================
   OPEN EDIT LESSON MODAL
   ========================================================= */

function openEditLessonModal(lessonId) {

    const lesson =
        currentLessons.find(
            item =>
                Number(item.id) ===
                Number(lessonId)
        );


    if (!lesson) {
        return;
    }


    document.getElementById(
        "edit-lesson-id"
    ).value =
        lesson.id;


    document.getElementById(
        "edit-lesson-title"
    ).value =
        lesson.title || "";


    document.getElementById(
        "edit-lesson-description"
    ).value =
        lesson.description || "";


    document.getElementById(
        "edit-lesson-sort-order"
    ).value =
        Number(lesson.sort_order) || 1;


    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


/* =========================================================
   CLOSE EDIT LESSON MODAL
   ========================================================= */

function closeEditLessonModal() {

    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================================
   UPDATE LESSON
   ========================================================= */

async function updateLesson() {

    const id =
        Number(
            document.getElementById(
                "edit-lesson-id"
            ).value
        );


    const title =
        document.getElementById(
            "edit-lesson-title"
        ).value.trim();


    const description =
        document.getElementById(
            "edit-lesson-description"
        ).value.trim();


    const sortOrder =
        Number(
            document.getElementById(
                "edit-lesson-sort-order"
            ).value
        );


    if (!id) {
        return;
    }


    if (!title) {

        showAdminMessage(
            "Please enter a lesson title.",
            "warning"
        );

        return;
    }


    if (
        !Number.isInteger(sortOrder) ||
        sortOrder < 1
    ) {

        showAdminMessage(
            "Sort Order must be 1 or higher.",
            "warning"
        );

        return;
    }


    try {

        /*
         * IMPORTANT:
         * lessons table has NO updated_at column.
         */

        const { data, error } =
            await supabaseClient
                .from("lessons")
                .update({
                    title:
                        title,

                    description:
                        description || null,

                    sort_order:
                        sortOrder
                })
                .eq("id", id)
                .select()
                .single();


        if (error) {

            console.error(
                "Error updating lesson:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        const index =
            currentLessons.findIndex(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (index !== -1) {

            currentLessons[index] =
                data;

        }


        currentLessons.sort(
            (a, b) =>
                Number(a.sort_order) -
                Number(b.sort_order)
        );


        renderLessons();


        closeEditLessonModal();


        showAdminMessage(
            "Lesson updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while updating lesson.",
            "error"
        );

    }

}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(lessonId) {

    const lesson =
        currentLessons.find(
            item =>
                Number(item.id) ===
                Number(lessonId)
        );


    if (!lesson) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${lesson.title}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const { error } =
            await supabaseClient
                .from("lessons")
                .delete()
                .eq(
                    "id",
                    Number(lessonId)
                );


        if (error) {

            console.error(
                "Error deleting lesson:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        currentLessons =
            currentLessons.filter(
                item =>
                    Number(item.id) !==
                    Number(lessonId)
            );


        renderLessons();


        showAdminMessage(
            "Lesson deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while deleting lesson.",
            "error"
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeLessonHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   CLOSE MODALS BY CLICKING OUTSIDE
   ========================================================= */

window.addEventListener(
    "click",
    function (event) {

        const addModal =
            document.getElementById(
                "add-lesson-modal"
            );


        const editModal =
            document.getElementById(
                "edit-lesson-modal"
            );


        if (
            event.target === addModal
        ) {

            closeAddLessonModal();

        }


        if (
            event.target === editModal
        ) {

            closeEditLessonModal();

        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadLessons =
    loadLessons;

window.openAddLessonModal =
    openAddLessonModal;

window.closeAddLessonModal =
    closeAddLessonModal;

window.addLesson =
    addLesson;

window.openEditLessonModal =
    openEditLessonModal;

window.closeEditLessonModal =
    closeEditLessonModal;

window.updateLesson =
    updateLesson;

window.deleteLesson =
    deleteLesson;