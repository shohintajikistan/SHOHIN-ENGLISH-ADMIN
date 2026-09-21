/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Lessons Management
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLessonLevels = [];
let currentLessons = [];
let selectedLessonLevelId = null;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("LESSONS JS: loaded");

    loadLessonLevels();

});


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLessonLevels() {

    const select =
        document.getElementById("lesson-level-select");

    if (!select) {
        console.error(
            "LESSONS: #lesson-level-select not found"
        );
        return;
    }

    if (!window.supabaseClient) {

        console.error(
            "LESSONS: Supabase client not found"
        );

        select.innerHTML =
            '<option value="">Supabase error</option>';

        return;
    }

    try {

        const result =
            await window.supabaseClient
                .from("levels")
                .select("id, code, name, sort_order")
                .order("sort_order", {
                    ascending: true
                });


        if (result.error) {

            console.error(
                "LESSONS: levels error",
                result.error
            );

            select.innerHTML =
                '<option value="">Error loading levels</option>';

            return;
        }


        adminLessonLevels =
            result.data || [];


        select.innerHTML =
            '<option value="">Select a level...</option>';


        adminLessonLevels.forEach(function (level) {

            const option =
                document.createElement("option");

            option.value =
                String(level.id);

            option.textContent =
                `${level.code} — ${level.name}`;

            select.appendChild(option);

        });


        /*
         * IMPORTANT:
         * Use addEventListener instead of replacing onchange.
         */

        select.addEventListener(
            "change",
            handleLessonLevelChange
        );


        console.log(
            "LESSONS: levels loaded",
            adminLessonLevels
        );


    } catch (error) {

        console.error(
            "LESSONS: load levels exception",
            error
        );

    }

}


/* =========================================================
   LEVEL CHANGE
   ========================================================= */

function handleLessonLevelChange(event) {

    const value =
        event.target.value;


    if (!value) {

        selectedLessonLevelId = null;

        currentLessons = [];

        renderLessons();

        return;
    }


    selectedLessonLevelId =
        Number(value);


    console.log(
        "LESSONS: selected level",
        selectedLessonLevelId
    );


    loadLessons(
        selectedLessonLevelId
    );

}


/* =========================================================
   INITIALIZE LESSONS
   ========================================================= */

async function initializeLessons() {

    console.log(
        "LESSONS: initializeLessons()"
    );

    await loadLessonLevels();

}


/* =========================================================
   LOAD LESSONS
   ========================================================= */

async function loadLessons(levelId) {

    const list =
        document.getElementById("lessons-list");


    if (!list) {
        return;
    }


    list.innerHTML =
        '<div class="empty-state">Loading lessons...</div>';


    try {

        const result =
            await window.supabaseClient
                .from("lessons")
                .select("*")
                .eq("level_id", levelId)
                .order("sort_order", {
                    ascending: true
                });


        if (result.error) {

            console.error(
                "LESSONS: load error",
                result.error
            );

            list.innerHTML =
                '<div class="empty-state">Failed to load lessons.</div>';

            return;
        }


        currentLessons =
            result.data || [];


        renderLessons();


    } catch (error) {

        console.error(
            "LESSONS: load exception",
            error
        );

    }

}


/* =========================================================
   RENDER LESSONS
   ========================================================= */

function renderLessons() {

    const list =
        document.getElementById("lessons-list");


    if (!list) {
        return;
    }


    if (!selectedLessonLevelId) {

        list.innerHTML =
            '<div class="empty-state">Select a level to see lessons.</div>';

        return;
    }


    if (currentLessons.length === 0) {

        list.innerHTML =
            '<div class="empty-state">No lessons for this level yet.</div>';

        return;
    }


    list.innerHTML = "";


    currentLessons.forEach(function (lesson) {

        const item =
            document.createElement("div");

        item.className =
            "lesson-item";


        item.innerHTML = `

            <div class="lesson-info">

                <div class="lesson-order">
                    ${lesson.sort_order}
                </div>

                <div>

                    <h3>
                        ${escapeHtml(
                            lesson.title || ""
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            lesson.description || ""
                        )}
                    </p>

                </div>

            </div>


            <div class="lesson-actions">

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


        list.appendChild(item);

    });

}


/* =========================================================
   OPEN ADD LESSON MODAL
   ========================================================= */

function openAddLessonModal() {

    console.log(
        "LESSONS: Add Lesson clicked"
    );


    /*
     * First make sure a level is selected.
     */

    if (!selectedLessonLevelId) {

        alert(
            "Please select a level first."
        );

        return;
    }


    const modal =
        document.getElementById(
            "add-lesson-modal"
        );


    if (!modal) {

        console.error(
            "LESSONS: #add-lesson-modal not found"
        );

        alert(
            "Add Lesson modal was not found."
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


    if (titleInput) {
        titleInput.value = "";
    }


    if (descriptionInput) {
        descriptionInput.value = "";
    }


    if (sortInput) {

        sortInput.value =
            currentLessons.length + 1;

    }


    /*
     * Remove possible hidden/closed state.
     */

    modal.style.display = "flex";

    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    console.log(
        "LESSONS: Add Lesson modal opened"
    );

}


/* =========================================================
   CLOSE ADD LESSON MODAL
   ========================================================= */

function closeAddLessonModal() {

    const modal =
        document.getElementById(
            "add-lesson-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.style.display = "none";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   ADD LESSON
   ========================================================= */

async function addLesson() {

    if (!selectedLessonLevelId) {

        alert(
            "Please select a level first."
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


    const sortOrder =
        sortInput
            ? Number(sortInput.value)
            : currentLessons.length + 1;


    if (!title) {

        alert(
            "Please enter a lesson title."
        );

        return;
    }


    try {

        const result =
            await window.supabaseClient
                .from("lessons")
                .insert([
                    {
                        level_id:
                            selectedLessonLevelId,

                        title:
                            title,

                        description:
                            description,

                        sort_order:
                            sortOrder
                    }
                ])
                .select()
                .single();


        if (result.error) {

            console.error(
                "LESSONS: insert error",
                result.error
            );

            alert(
                result.error.message
            );

            return;
        }


        currentLessons.push(
            result.data
        );


        currentLessons.sort(
            function (a, b) {

                return (
                    a.sort_order -
                    b.sort_order
                );

            }
        );


        renderLessons();

        closeAddLessonModal();


        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }


        alert(
            "Lesson added successfully."
        );


    } catch (error) {

        console.error(
            "LESSONS: insert exception",
            error
        );

        alert(
            "Failed to add lesson."
        );

    }

}


/* =========================================================
   OPEN EDIT LESSON
   ========================================================= */

function openEditLessonModal(id) {

    const lesson =
        currentLessons.find(function (item) {

            return item.id === id;

        });


    if (!lesson) {
        return;
    }


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
        titleInput.value =
            lesson.title || "";
    }


    if (descriptionInput) {
        descriptionInput.value =
            lesson.description || "";
    }


    if (sortInput) {
        sortInput.value =
            lesson.sort_order || 1;
    }


    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (!modal) {
        return;
    }


    modal.style.display = "flex";

    modal.classList.add("active");

}


/* =========================================================
   CLOSE EDIT LESSON
   ========================================================= */

function closeEditLessonModal() {

    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("active");

    modal.style.display = "none";

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


    if (!title) {

        alert(
            "Please enter a lesson title."
        );

        return;
    }


    try {

        const result =
            await window.supabaseClient
                .from("lessons")
                .update({
                    title:
                        title,

                    description:
                        description,

                    sort_order:
                        sortOrder
                })
                .eq("id", id)
                .select()
                .single();


        if (result.error) {

            alert(
                result.error.message
            );

            return;
        }


        const index =
            currentLessons.findIndex(
                function (item) {

                    return item.id === id;

                }
            );


        if (index !== -1) {

            currentLessons[index] =
                result.data;

        }


        currentLessons.sort(
            function (a, b) {

                return (
                    a.sort_order -
                    b.sort_order
                );

            }
        );


        renderLessons();

        closeEditLessonModal();


        alert(
            "Lesson updated successfully."
        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(id) {

    if (
        !confirm(
            "Delete this lesson?"
        )
    ) {

        return;
    }


    try {

        const result =
            await window.supabaseClient
                .from("lessons")
                .delete()
                .eq("id", id);


        if (result.error) {

            alert(
                result.error.message
            );

            return;
        }


        currentLessons =
            currentLessons.filter(
                function (item) {

                    return item.id !== id;

                }
            );


        renderLessons();


        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadLessonLevels =
    loadLessonLevels;

window.initializeLessons =
    initializeLessons;

window.loadLessons =
    loadLessons;

window.renderLessons =
    renderLessons;

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