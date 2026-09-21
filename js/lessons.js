/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Lessons Management
   Supabase + Levels
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLevels = [];
let currentLessons = [];
let selectedLessonLevelId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("LESSONS.JS: initialized");

    loadLessonLevels();

});


/* =========================================================
   LOAD LEVELS FOR LESSON SELECT
   ========================================================= */

async function loadLessonLevels() {

    console.log("LESSONS: loading levels...");

    const select = document.getElementById("lesson-level-select");

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

        select.innerHTML = `
            <option value="">
                Supabase connection error
            </option>
        `;

        return;
    }


    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("levels")
            .select("*")
            .order("sort_order", {
                ascending: true
            });


        if (error) {

            console.error(
                "LESSONS: failed to load levels:",
                error
            );

            select.innerHTML = `
                <option value="">
                    Error loading levels
                </option>
            `;

            showAdminMessage(
                "Failed to load levels: " + error.message,
                "error"
            );

            return;
        }


        adminLevels = data || [];

        console.log(
            "LESSONS: levels loaded:",
            adminLevels
        );


        /* ---------------------------------------------
           EMPTY
           --------------------------------------------- */

        if (adminLevels.length === 0) {

            select.innerHTML = `
                <option value="">
                    No levels found
                </option>
            `;

            return;
        }


        /* ---------------------------------------------
           BUILD SELECT
           --------------------------------------------- */

        select.innerHTML = `
            <option value="">
                Select a level...
            </option>
        `;


        adminLevels.forEach(function (level) {

            const option =
                document.createElement("option");

            option.value = level.id;

            option.textContent =
                level.code +
                " — " +
                level.name;

            select.appendChild(option);

        });


        console.log(
            "LESSONS: level selector populated"
        );


        /* ---------------------------------------------
           SELECT CHANGE
           --------------------------------------------- */

        select.onchange = function () {

            const levelId = this.value;

            console.log(
                "LESSONS: selected level:",
                levelId
            );


            if (!levelId) {

                selectedLessonLevelId = null;

                currentLessons = [];

                renderLessons();

                return;
            }


            selectedLessonLevelId =
                Number(levelId);


            loadLessons(
                selectedLessonLevelId
            );

        };


    } catch (error) {

        console.error(
            "LESSONS: unexpected error:",
            error
        );

        select.innerHTML = `
            <option value="">
                Error loading levels
            </option>
        `;

    }

}


/* =========================================================
   INITIALIZE LESSONS
   Called by admin.js when Lessons section opens
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

    console.log(
        "LESSONS: loading lessons for level:",
        levelId
    );


    const lessonsList =
        document.getElementById("lessons-list");


    if (!lessonsList) {

        console.error(
            "LESSONS: #lessons-list not found"
        );

        return;
    }


    lessonsList.innerHTML = `
        <div class="empty-state">
            Loading lessons...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await window.supabaseClient
            .from("lessons")
            .select("*")
            .eq("level_id", levelId)
            .order("sort_order", {
                ascending: true
            });


        if (error) {

            console.error(
                "LESSONS: failed to load lessons:",
                error
            );

            lessonsList.innerHTML = `
                <div class="empty-state">
                    Failed to load lessons.
                </div>
            `;

            showAdminMessage(
                "Failed to load lessons: " +
                error.message,
                "error"
            );

            return;
        }


        currentLessons = data || [];

        console.log(
            "LESSONS: loaded:",
            currentLessons
        );


        renderLessons();

    } catch (error) {

        console.error(
            "LESSONS: unexpected error:",
            error
        );

        lessonsList.innerHTML = `
            <div class="empty-state">
                Error loading lessons.
            </div>
        `;

    }

}


/* =========================================================
   RENDER LESSONS
   ========================================================= */

function renderLessons() {

    const lessonsList =
        document.getElementById("lessons-list");


    if (!lessonsList) {
        return;
    }


    if (
        !selectedLessonLevelId
    ) {

        lessonsList.innerHTML = `
            <div class="empty-state">
                Select a level to see lessons.
            </div>
        `;

        return;
    }


    if (
        currentLessons.length === 0
    ) {

        lessonsList.innerHTML = `
            <div class="empty-state">
                No lessons for this level yet.
            </div>
        `;

        return;
    }


    lessonsList.innerHTML = "";


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


        lessonsList.appendChild(item);

    });

}


/* =========================================================
   OPEN ADD LESSON MODAL
   ========================================================= */

function openAddLessonModal() {

    if (!selectedLessonLevelId) {

        showAdminMessage(
            "Please select a level first.",
            "error"
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


    if (titleInput) {
        titleInput.value = "";
    }


    if (descriptionInput) {
        descriptionInput.value = "";
    }


    if (orderInput) {

        const nextOrder =
            currentLessons.length + 1;

        orderInput.value =
            nextOrder;

    }


    modal.classList.add("active");

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
        modal.classList.remove("active");
    }

}


/* =========================================================
   ADD LESSON
   ========================================================= */

async function addLesson() {

    if (!selectedLessonLevelId) {

        showAdminMessage(
            "Please select a level first.",
            "error"
        );

        return;
    }


    const title =
        document.getElementById(
            "lesson-title-input"
        ).value.trim();


    const description =
        document.getElementById(
            "lesson-description-input"
        ).value.trim();


    const sortOrder =
        Number(
            document.getElementById(
                "lesson-sort-order-input"
            ).value
        );


    if (!title) {

        showAdminMessage(
            "Please enter a lesson title.",
            "error"
        );

        return;
    }


    if (!sortOrder || sortOrder < 1) {

        showAdminMessage(
            "Please enter a valid sort order.",
            "error"
        );

        return;
    }


    try {

        const {
            data,
            error
        } = await window.supabaseClient
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


        if (error) {

            console.error(
                "LESSONS: insert error:",
                error
            );

            showAdminMessage(
                "Failed to add lesson: " +
                error.message,
                "error"
            );

            return;
        }


        console.log(
            "LESSONS: lesson created:",
            data
        );


        currentLessons.push(data);


        currentLessons.sort(
            function (a, b) {
                return a.sort_order -
                    b.sort_order;
            }
        );


        renderLessons();

        closeAddLessonModal();


        showAdminMessage(
            "Lesson added successfully.",
            "success"
        );


        updateDashboardLessonCount();


    } catch (error) {

        console.error(
            "LESSONS: unexpected insert error:",
            error
        );

    }

}


/* =========================================================
   OPEN EDIT LESSON MODAL
   ========================================================= */

function openEditLessonModal(
    lessonId
) {

    const lesson =
        currentLessons.find(
            function (item) {
                return item.id === lessonId;
            }
        );


    if (!lesson) {

        console.error(
            "LESSONS: lesson not found:",
            lessonId
        );

        return;
    }


    document.getElementById(
        "edit-lesson-id"
    ).value = lesson.id;


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
        lesson.sort_order || 1;


    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (modal) {
        modal.classList.add("active");
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
        modal.classList.remove("active");
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


    if (!title) {

        showAdminMessage(
            "Please enter a lesson title.",
            "error"
        );

        return;
    }


    try {

        const {
            data,
            error
        } = await window.supabaseClient
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


        if (error) {

            console.error(
                "LESSONS: update error:",
                error
            );

            showAdminMessage(
                "Failed to update lesson: " +
                error.message,
                "error"
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
                data;
        }


        currentLessons.sort(
            function (a, b) {
                return a.sort_order -
                    b.sort_order;
            }
        );


        renderLessons();

        closeEditLessonModal();


        showAdminMessage(
            "Lesson updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "LESSONS: unexpected update error:",
            error
        );

    }

}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(
    lessonId
) {

    const confirmed =
        confirm(
            "Delete this lesson?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await window.supabaseClient
            .from("lessons")
            .delete()
            .eq("id", lessonId);


        if (error) {

            console.error(
                "LESSONS: delete error:",
                error
            );

            showAdminMessage(
                "Failed to delete lesson: " +
                error.message,
                "error"
            );

            return;
        }


        currentLessons =
            currentLessons.filter(
                function (item) {
                    return item.id !== lessonId;
                }
            );


        renderLessons();


        showAdminMessage(
            "Lesson deleted.",
            "success"
        );


        updateDashboardLessonCount();


    } catch (error) {

        console.error(
            "LESSONS: unexpected delete error:",
            error
        );

    }

}


/* =========================================================
   DASHBOARD LESSON COUNT
   ========================================================= */

async function updateDashboardLessonCount() {

    const countElement =
        document.getElementById(
            "dashboard-lessons-count"
        );


    if (!countElement) {
        return;
    }


    try {

        const {
            count,
            error
        } = await window.supabaseClient
            .from("lessons")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );


        if (error) {

            console.error(
                "LESSONS: dashboard count error:",
                error
            );

            return;
        }


        countElement.textContent =
            count || 0;


    } catch (error) {

        console.error(
            "LESSONS: dashboard count error:",
            error
        );

    }

}


/* =========================================================
   HTML ESCAPE
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

window.updateDashboardLessonCount =
    updateDashboardLessonCount;