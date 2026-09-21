/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Lessons Management
   Supabase + Levels
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLessonLevels = [];

let currentLessons = [];

let selectedLessonLevelId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "LESSONS: initialized"
        );

        loadLessonLevels();

    }
);


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLessonLevels() {

    console.log(
        "LESSONS: loading levels..."
    );


    const select =
        document.getElementById(
            "lesson-level-select"
        );


    if (!select) {

        console.error(
            "LESSONS: select not found"
        );

        return;
    }


    if (!window.supabaseClient) {

        console.error(
            "LESSONS: Supabase client missing"
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
        } =
            await window.supabaseClient
                .from("levels")
                .select(
                    "id, code, name, sort_order"
                )
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "LESSONS LEVEL ERROR:",
                error
            );


            select.innerHTML = `
                <option value="">
                    Error loading levels
                </option>
            `;

            return;
        }


        adminLessonLevels =
            data || [];


        console.log(
            "LESSONS LEVELS:",
            adminLessonLevels
        );


        select.innerHTML = `
            <option value="">
                Select a level...
            </option>
        `;


        adminLessonLevels.forEach(
            function (level) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    level.id;


                option.textContent =
                    level.code +
                    " — " +
                    level.name;


                select.appendChild(
                    option
                );

            }
        );


        select.onchange =
            function () {

                const value =
                    this.value;


                if (!value) {

                    selectedLessonLevelId =
                        null;

                    currentLessons =
                        [];

                    renderLessons();

                    return;
                }


                selectedLessonLevelId =
                    Number(value);


                loadLessons(
                    selectedLessonLevelId
                );

            };


        console.log(
            "LESSONS: selector ready"
        );


    } catch (error) {

        console.error(
            "LESSONS LEVEL ERROR:",
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
   ========================================================= */

async function initializeLessons() {

    console.log(
        "LESSONS: initialize"
    );


    await loadLessonLevels();

}


/* =========================================================
   LOAD LESSONS
   ========================================================= */

async function loadLessons(
    levelId
) {

    const list =
        document.getElementById(
            "lessons-list"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="empty-state">
            Loading lessons...
        </div>
    `;


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("lessons")
                .select("*")
                .eq(
                    "level_id",
                    levelId
                )
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "LESSONS LOAD ERROR:",
                error
            );


            list.innerHTML = `
                <div class="empty-state">
                    Failed to load lessons.
                </div>
            `;

            return;
        }


        currentLessons =
            data || [];


        renderLessons();


    } catch (error) {

        console.error(
            "LESSONS LOAD ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER LESSONS
   ========================================================= */

function renderLessons() {

    const list =
        document.getElementById(
            "lessons-list"
        );


    if (!list) {
        return;
    }


    if (!selectedLessonLevelId) {

        list.innerHTML = `
            <div class="empty-state">
                Select a level to see lessons.
            </div>
        `;

        return;
    }


    if (
        currentLessons.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-state">
                No lessons for this level yet.
            </div>
        `;

        return;
    }


    list.innerHTML = "";


    currentLessons.forEach(
        function (lesson) {

            const item =
                document.createElement(
                    "div"
                );


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


            list.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   ADD LESSON MODAL
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


    document.getElementById(
        "lesson-title-input"
    ).value = "";


    document.getElementById(
        "lesson-description-input"
    ).value = "";


    document.getElementById(
        "lesson-sort-order-input"
    ).value =
        currentLessons.length + 1;


    if (modal) {

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CLOSE ADD LESSON
   ========================================================= */

function closeAddLessonModal() {

    const modal =
        document.getElementById(
            "add-lesson-modal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

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


    try {

        const {
            data,
            error
        } =
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


        if (error) {

            console.error(
                "LESSON INSERT ERROR:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        currentLessons.push(
            data
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


        showAdminMessage(
            "Lesson added successfully.",
            "success"
        );


        if (
            typeof window.updateDashboard ===
            "function"
        ) {

            window.updateDashboard();

        }

    } catch (error) {

        console.error(
            "LESSON INSERT ERROR:",
            error
        );

    }

}


/* =========================================================
   EDIT LESSON
   ========================================================= */

function openEditLessonModal(
    id
) {

    const lesson =
        currentLessons.find(
            function (item) {

                return item.id === id;

            }
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
        lesson.sort_order || 1;


    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CLOSE EDIT
   ========================================================= */

function closeEditLessonModal() {

    const modal =
        document.getElementById(
            "edit-lesson-modal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

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


    try {

        const {
            data,
            error
        } =
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
                .eq(
                    "id",
                    id
                )
                .select()
                .single();


        if (error) {

            showAdminMessage(
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

                return (
                    a.sort_order -
                    b.sort_order
                );

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
            error
        );

    }

}


/* =========================================================
   DELETE LESSON
   ========================================================= */

async function deleteLesson(
    id
) {

    if (
        !confirm(
            "Delete this lesson?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await window.supabaseClient
                .from("lessons")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            showAdminMessage(
                error.message,
                "error"
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


        showAdminMessage(
            "Lesson deleted.",
            "success"
        );


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

function escapeHtml(
    value
) {

    return String(value)
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