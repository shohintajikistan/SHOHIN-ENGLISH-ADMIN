/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   LEVELS MANAGEMENT
   Supabase + Levels CRUD
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLevels = [];


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("LEVELS: initializing...");

    loadLevels();

});


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLevels() {

    const list =
        document.getElementById("levels-list");

    if (!list) {

        console.error(
            "LEVELS: #levels-list not found."
        );

        return;
    }


    list.innerHTML =
        '<div class="loading">' +
        '<div class="spinner"></div>' +
        '<span>Loading levels...</span>' +
        '</div>';


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
                "LEVELS: load error:",
                error
            );

            list.innerHTML =
                '<div class="empty-state">' +
                '<strong>Error loading levels</strong><br>' +
                escapeLevelHtml(error.message) +
                '</div>';

            return;
        }


        adminLevels = data || [];

        renderLevels();


    } catch (error) {

        console.error(
            "LEVELS: unexpected error:",
            error
        );

        list.innerHTML =
            '<div class="empty-state">' +
            '<strong>Error</strong><br>' +
            escapeLevelHtml(error.message) +
            '</div>';

    }

}


/* =========================================================
   RENDER LEVELS
   ========================================================= */

function renderLevels() {

    const list =
        document.getElementById("levels-list");

    if (!list) return;


    if (!adminLevels.length) {

        list.innerHTML =
            '<div class="empty-state">' +
            '<strong>No levels found</strong><br>' +
            'Click "+ Add Level" to create a level.' +
            '</div>';

        return;
    }


    list.innerHTML = "";


    adminLevels.forEach(
        function (level) {

            const card =
                document.createElement("div");

            card.className =
                "level-card";


            card.innerHTML =

                '<div class="level-card-header">' +

                    '<div>' +

                        '<div class="level-code">' +
                            escapeLevelHtml(
                                level.code
                            ) +
                        '</div>' +

                        '<h3>' +
                            escapeLevelHtml(
                                level.name
                            ) +
                        '</h3>' +

                    '</div>' +

                    '<span class="badge badge-lime">' +
                        'Order ' +
                        (
                            level.sort_order ||
                            "-"
                        ) +
                    '</span>' +

                '</div>' +


                '<p>' +
                    escapeLevelHtml(
                        level.description ||
                        "No description"
                    ) +
                '</p>' +


                '<div class="level-card-actions">' +

                    '<button ' +
                        'type="button" ' +
                        'class="btn btn-secondary btn-sm" ' +
                        'onclick="openEditLevelModal(' +
                            level.id +
                        ')">' +
                        'Edit' +
                    '</button>' +


                    '<button ' +
                        'type="button" ' +
                        'class="btn btn-danger btn-sm" ' +
                        'onclick="deleteLevel(' +
                            level.id +
                        ')">' +
                        'Delete' +
                    '</button>' +

                '</div>';


            list.appendChild(card);

        }
    );

}


/* =========================================================
   OPEN ADD LEVEL MODAL
   ========================================================= */

function openAddLevelModal() {

    console.log(
        "LEVELS: openAddLevelModal()"
    );


    const modal =
        document.getElementById(
            "add-level-modal"
        );


    if (!modal) {

        console.error(
            "LEVELS: #add-level-modal not found."
        );

        showAdminMessage(
            "Add Level window was not found.",
            "error"
        );

        return;
    }


    const codeInput =
        document.getElementById(
            "level-code-input"
        );

    const nameInput =
        document.getElementById(
            "level-name-input"
        );

    const descriptionInput =
        document.getElementById(
            "level-description-input"
        );

    const sortInput =
        document.getElementById(
            "level-sort-order-input"
        );


    if (codeInput) {
        codeInput.value = "";
    }

    if (nameInput) {
        nameInput.value = "";
    }

    if (descriptionInput) {
        descriptionInput.value = "";
    }

    if (sortInput) {

        sortInput.value =
            getNextLevelSortOrder();

    }


    modal.classList.add("active");

    modal.style.display = "flex";

    modal.style.visibility = "visible";

    modal.style.opacity = "1";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    if (codeInput) {

        setTimeout(
            function () {
                codeInput.focus();
            },
            100
        );

    }

}


/* =========================================================
   CLOSE ADD LEVEL MODAL
   ========================================================= */

function closeAddLevelModal() {

    const modal =
        document.getElementById(
            "add-level-modal"
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
   GET NEXT SORT ORDER
   ========================================================= */

function getNextLevelSortOrder() {

    if (!adminLevels.length) {
        return 1;
    }


    const numbers =
        adminLevels.map(
            function (level) {

                return Number(
                    level.sort_order
                ) || 0;

            }
        );


    return Math.max(...numbers) + 1;

}


/* =========================================================
   ADD LEVEL
   ========================================================= */

async function addLevel() {

    const codeInput =
        document.getElementById(
            "level-code-input"
        );

    const nameInput =
        document.getElementById(
            "level-name-input"
        );

    const descriptionInput =
        document.getElementById(
            "level-description-input"
        );

    const sortInput =
        document.getElementById(
            "level-sort-order-input"
        );


    const code =
        codeInput
            ? codeInput.value.trim().toUpperCase()
            : "";


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    const sortOrder =
        sortInput
            ? Number(sortInput.value)
            : getNextLevelSortOrder();


    if (!code) {

        showAdminMessage(
            "Level code is required.",
            "warning"
        );

        if (codeInput) {
            codeInput.focus();
        }

        return;
    }


    if (!name) {

        showAdminMessage(
            "Level name is required.",
            "warning"
        );

        if (nameInput) {
            nameInput.focus();
        }

        return;
    }


    try {

        /*
           Check duplicate code first.
        */

        const {
            data: existingLevel,
            error: checkError
        } =
            await supabaseClient
                .from("levels")
                .select("id")
                .eq("code", code)
                .maybeSingle();


        if (checkError) {

            console.error(
                "LEVELS: duplicate check error:",
                checkError
            );

            showAdminMessage(
                "Could not check level: " +
                checkError.message,
                "error"
            );

            return;
        }


        if (existingLevel) {

            showAdminMessage(
                "This level code already exists.",
                "warning"
            );

            return;
        }


        /*
           Insert level.
        */

        const { data, error } =
            await supabaseClient
                .from("levels")
                .insert([
                    {
                        code: code,
                        name: name,
                        description: description,
                        sort_order: sortOrder
                    }
                ])
                .select()
                .single();


        if (error) {

            console.error(
                "LEVELS: add error:",
                error
            );

            showAdminMessage(
                "Could not add level: " +
                error.message,
                "error"
            );

            return;
        }


        console.log(
            "LEVELS: level added:",
            data
        );


        closeAddLevelModal();


        showAdminMessage(
            "Level added successfully.",
            "success"
        );


        await loadLevels();


        if (typeof updateDashboard === "function") {
            updateDashboard();
        }


        /*
           Also refresh lesson level selector.
        */

        if (
            typeof loadLessonLevels ===
            "function"
        ) {

            await loadLessonLevels();

        }


    } catch (error) {

        console.error(
            "LEVELS: unexpected add error:",
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
   OPEN EDIT LEVEL MODAL
   ========================================================= */

function openEditLevelModal(levelId) {

    const level =
        adminLevels.find(
            function (item) {

                return Number(item.id) ===
                    Number(levelId);

            }
        );


    if (!level) {

        showAdminMessage(
            "Level not found.",
            "error"
        );

        return;
    }


    const modal =
        document.getElementById(
            "edit-level-modal"
        );


    if (!modal) {

        console.error(
            "LEVELS: #edit-level-modal not found."
        );

        showAdminMessage(
            "Edit Level window was not found.",
            "error"
        );

        return;
    }


    const idInput =
        document.getElementById(
            "edit-level-id"
        );

    const codeInput =
        document.getElementById(
            "edit-level-code"
        );

    const nameInput =
        document.getElementById(
            "edit-level-name"
        );

    const descriptionInput =
        document.getElementById(
            "edit-level-description"
        );

    const sortInput =
        document.getElementById(
            "edit-level-sort-order"
        );


    if (idInput) {
        idInput.value = level.id;
    }

    if (codeInput) {
        codeInput.value =
            level.code || "";
    }

    if (nameInput) {
        nameInput.value =
            level.name || "";
    }

    if (descriptionInput) {
        descriptionInput.value =
            level.description || "";
    }

    if (sortInput) {
        sortInput.value =
            level.sort_order || 1;
    }


    modal.classList.add("active");

    modal.style.display = "flex";

    modal.style.visibility = "visible";

    modal.style.opacity = "1";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    if (codeInput) {

        setTimeout(
            function () {
                codeInput.focus();
            },
            100
        );

    }

}


/* =========================================================
   CLOSE EDIT LEVEL MODAL
   ========================================================= */

function closeEditLevelModal() {

    const modal =
        document.getElementById(
            "edit-level-modal"
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
   UPDATE LEVEL
   ========================================================= */

async function updateLevel() {

    const idInput =
        document.getElementById(
            "edit-level-id"
        );

    const codeInput =
        document.getElementById(
            "edit-level-code"
        );

    const nameInput =
        document.getElementById(
            "edit-level-name"
        );

    const descriptionInput =
        document.getElementById(
            "edit-level-description"
        );

    const sortInput =
        document.getElementById(
            "edit-level-sort-order"
        );


    const levelId =
        idInput
            ? Number(idInput.value)
            : null;


    const code =
        codeInput
            ? codeInput.value.trim().toUpperCase()
            : "";


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";


    const sortOrder =
        sortInput
            ? Number(sortInput.value)
            : 1;


    if (!levelId) {

        showAdminMessage(
            "Level ID is missing.",
            "error"
        );

        return;
    }


    if (!code) {

        showAdminMessage(
            "Level code is required.",
            "warning"
        );

        return;
    }


    if (!name) {

        showAdminMessage(
            "Level name is required.",
            "warning"
        );

        return;
    }


    try {

        /*
           Check whether another level
           already uses this code.
        */

        const {
            data: duplicate,
            error: duplicateError
        } =
            await supabaseClient
                .from("levels")
                .select("id")
                .eq("code", code)
                .neq("id", levelId)
                .maybeSingle();


        if (duplicateError) {

            console.error(
                "LEVELS: duplicate check error:",
                duplicateError
            );

            showAdminMessage(
                "Could not check level code: " +
                duplicateError.message,
                "error"
            );

            return;
        }


        if (duplicate) {

            showAdminMessage(
                "Another level already uses this code.",
                "warning"
            );

            return;
        }


        const { data, error } =
            await supabaseClient
                .from("levels")
                .update({
                    code: code,
                    name: name,
                    description: description,
                    sort_order: sortOrder
                })
                .eq("id", levelId)
                .select()
                .single();


        if (error) {

            console.error(
                "LEVELS: update error:",
                error
            );

            showAdminMessage(
                "Could not update level: " +
                error.message,
                "error"
            );

            return;
        }


        console.log(
            "LEVELS: level updated:",
            data
        );


        closeEditLevelModal();


        showAdminMessage(
            "Level updated successfully.",
            "success"
        );


        await loadLevels();


        if (typeof updateDashboard === "function") {
            updateDashboard();
        }


        if (
            typeof loadLessonLevels ===
            "function"
        ) {

            await loadLessonLevels();

        }


    } catch (error) {

        console.error(
            "LEVELS: unexpected update error:",
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
   DELETE LEVEL
   ========================================================= */

async function deleteLevel(levelId) {

    const level =
        adminLevels.find(
            function (item) {

                return Number(item.id) ===
                    Number(levelId);

            }
        );


    if (!level) {

        showAdminMessage(
            "Level not found.",
            "error"
        );

        return;
    }


    /*
       Check whether level has lessons.
    */

    try {

        const {
            count,
            error: countError
        } =
            await supabaseClient
                .from("lessons")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "level_id",
                    levelId
                );


        if (countError) {

            console.error(
                "LEVELS: lesson check error:",
                countError
            );

            showAdminMessage(
                "Could not check level lessons: " +
                countError.message,
                "error"
            );

            return;
        }


        if (count && count > 0) {

            showAdminMessage(
                "This level has " +
                count +
                " lesson(s). Delete its lessons first.",
                "warning"
            );

            return;
        }


        const confirmed =
            window.confirm(
                'Delete level "' +
                level.code +
                ' — ' +
                level.name +
                '"?'
            );


        if (!confirmed) {
            return;
        }


        const { error } =
            await supabaseClient
                .from("levels")
                .delete()
                .eq("id", levelId);


        if (error) {

            console.error(
                "LEVELS: delete error:",
                error
            );

            showAdminMessage(
                "Could not delete level: " +
                error.message,
                "error"
            );

            return;
        }


        showAdminMessage(
            "Level deleted successfully.",
            "success"
        );


        await loadLevels();


        if (typeof updateDashboard === "function") {
            updateDashboard();
        }


        if (
            typeof loadLessonLevels ===
            "function"
        ) {

            await loadLessonLevels();

        }


    } catch (error) {

        console.error(
            "LEVELS: unexpected delete error:",
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

function escapeLevelHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
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
   CLOSE MODALS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const addModal =
            document.getElementById(
                "add-level-modal"
            );

        const editModal =
            document.getElementById(
                "edit-level-modal"
            );


        if (
            addModal &&
            event.target === addModal
        ) {

            closeAddLevelModal();

        }


        if (
            editModal &&
            event.target === editModal
        ) {

            closeEditLevelModal();

        }

    }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }


        closeAddLevelModal();

        closeEditLevelModal();

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.loadLevels =
    loadLevels;

window.openAddLevelModal =
    openAddLevelModal;

window.closeAddLevelModal =
    closeAddLevelModal;

window.addLevel =
    addLevel;

window.openEditLevelModal =
    openEditLevelModal;

window.closeEditLevelModal =
    closeEditLevelModal;

window.updateLevel =
    updateLevel;

window.deleteLevel =
    deleteLevel;


/* =========================================================
   END
   ========================================================= */