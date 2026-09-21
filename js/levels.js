/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   LEVELS MANAGEMENT
   Supabase
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLevels = [];


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "SHOHIN ENGLISH — Levels loaded."
        );

        await loadLevels();

    }
);


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLevels() {

    const container =
        document.getElementById(
            "levels-list"
        );


    if (!container) {

        console.warn(
            "levels-list not found."
        );

        return;
    }


    container.innerHTML = `
        <div class="empty-state">
            Loading levels...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("levels")
            .select("*")
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Error loading levels:",
                error
            );


            container.innerHTML = `
                <div class="empty-state">
                    Failed to load levels.<br>
                    ${escapeLevelHTML(
                        error.message
                    )}
                </div>
            `;

            return;
        }


        adminLevels = data || [];


        renderLevels();


        updateLevelCount();


    } catch (error) {

        console.error(
            "Unexpected error loading levels:",
            error
        );


        container.innerHTML = `
            <div class="empty-state">
                Unexpected error while loading levels.
            </div>
        `;

    }

}


/* =========================================================
   RENDER LEVELS
   ========================================================= */

function renderLevels() {

    const container =
        document.getElementById(
            "levels-list"
        );


    if (!container) {
        return;
    }


    if (
        !adminLevels ||
        adminLevels.length === 0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No levels found.
            </div>
        `;

        return;
    }


    container.innerHTML = "";


    adminLevels.forEach(
        function (level, index) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "level-card";


            const code =
                escapeLevelHTML(
                    level.code ||
                    `L${index + 1}`
                );


            const name =
                escapeLevelHTML(
                    level.name ||
                    "Unnamed Level"
                );


            const description =
                escapeLevelHTML(
                    level.description ||
                    ""
                );


            const sortOrder =
                Number(
                    level.sort_order
                ) ||
                index + 1;


            card.innerHTML = `

                <div class="level-card-header">

                    <div>

                        <div class="level-code">
                            ${code}
                        </div>

                        <h3>
                            ${name}
                        </h3>

                        ${
                            description
                                ? `
                                    <p>
                                        ${description}
                                    </p>
                                  `
                                : ""
                        }

                    </div>

                </div>


                <div>

                    <span class="badge badge-green">
                        Order ${sortOrder}
                    </span>

                </div>


                <div class="level-card-actions">

                    <button
                        type="button"
                        class="btn btn-secondary btn-sm"
                        onclick="openEditLevelModal(${level.id})"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        onclick="deleteLevel(${level.id})"
                    >
                        Delete
                    </button>

                </div>

            `;


            container.appendChild(card);

        }
    );

}


/* =========================================================
   OPEN ADD LEVEL MODAL
   ========================================================= */

function openAddLevelModal() {

    const modal =
        document.getElementById(
            "add-level-modal"
        );


    if (!modal) {

        console.warn(
            "add-level-modal not found."
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


    const orderInput =
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


    if (orderInput) {

        orderInput.value =
            adminLevels.length + 1;

    }


    modal.style.display = "flex";

}


/* =========================================================
   CLOSE ADD LEVEL MODAL
   ========================================================= */

function closeAddLevelModal() {

    const modal =
        document.getElementById(
            "add-level-modal"
        );


    if (modal) {

        modal.style.display = "none";

    }

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


    const orderInput =
        document.getElementById(
            "level-sort-order-input"
        );


    if (
        !codeInput ||
        !nameInput ||
        !descriptionInput ||
        !orderInput
    ) {

        showAdminMessage(
            "Level form not found.",
            "error"
        );

        return;
    }


    const code =
        codeInput.value.trim();


    const name =
        nameInput.value.trim();


    const description =
        descriptionInput.value.trim();


    const sortOrder =
        Number(
            orderInput.value
        );


    if (!code) {

        showAdminMessage(
            "Please enter a level code.",
            "warning"
        );

        codeInput.focus();

        return;
    }


    if (!name) {

        showAdminMessage(
            "Please enter a level name.",
            "warning"
        );

        nameInput.focus();

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

        const {
            data,
            error
        } = await supabaseClient
            .from("levels")
            .insert([
                {
                    code:
                        code,

                    name:
                        name,

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
                "Error adding level:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        adminLevels.push(data);


        adminLevels.sort(
            function (a, b) {

                return (
                    Number(a.sort_order) -
                    Number(b.sort_order)
                );

            }
        );


        renderLevels();


        updateLevelCount();


        closeAddLevelModal();


        showAdminMessage(
            "Level added successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while adding level.",
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

                return (
                    Number(item.id) ===
                    Number(levelId)
                );

            }
        );


    if (!level) {

        console.warn(
            "Level not found:",
            levelId
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


    const orderInput =
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


    if (orderInput) {
        orderInput.value =
            Number(level.sort_order) || 1;
    }


    const modal =
        document.getElementById(
            "edit-level-modal"
        );


    if (modal) {

        modal.style.display = "flex";

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


    if (modal) {

        modal.style.display = "none";

    }

}


/* =========================================================
   UPDATE LEVEL
   ========================================================= */

async function updateLevel() {

    const id =
        Number(
            document.getElementById(
                "edit-level-id"
            ).value
        );


    const code =
        document.getElementById(
            "edit-level-code"
        ).value.trim();


    const name =
        document.getElementById(
            "edit-level-name"
        ).value.trim();


    const description =
        document.getElementById(
            "edit-level-description"
        ).value.trim();


    const sortOrder =
        Number(
            document.getElementById(
                "edit-level-sort-order"
            ).value
        );


    if (!id) {

        showAdminMessage(
            "Invalid level ID.",
            "error"
        );

        return;
    }


    if (!code) {

        showAdminMessage(
            "Please enter a level code.",
            "warning"
        );

        return;
    }


    if (!name) {

        showAdminMessage(
            "Please enter a level name.",
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

        const {
            data,
            error
        } = await supabaseClient
            .from("levels")
            .update({
                code:
                    code,

                name:
                    name,

                description:
                    description || null,

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

            console.error(
                "Error updating level:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        const index =
            adminLevels.findIndex(
                function (item) {

                    return (
                        Number(item.id) ===
                        Number(id)
                    );

                }
            );


        if (index !== -1) {

            adminLevels[index] =
                data;

        }


        adminLevels.sort(
            function (a, b) {

                return (
                    Number(a.sort_order) -
                    Number(b.sort_order)
                );

            }
        );


        renderLevels();


        updateLevelCount();


        closeEditLevelModal();


        showAdminMessage(
            "Level updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while updating level.",
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

                return (
                    Number(item.id) ===
                    Number(levelId)
                );

            }
        );


    if (!level) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${level.code} — ${level.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("levels")
            .delete()
            .eq(
                "id",
                Number(levelId)
            );


        if (error) {

            console.error(
                "Error deleting level:",
                error
            );


            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        adminLevels =
            adminLevels.filter(
                function (item) {

                    return (
                        Number(item.id) !==
                        Number(levelId)
                    );

                }
            );


        renderLevels();


        updateLevelCount();


        showAdminMessage(
            "Level deleted successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );


        showAdminMessage(
            "Unexpected error while deleting level.",
            "error"
        );

    }

}


/* =========================================================
   UPDATE LEVEL COUNT
   ========================================================= */

function updateLevelCount() {

    const element =
        document.getElementById(
            "dashboard-level-count"
        );


    if (element) {

        element.textContent =
            adminLevels.length;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeLevelHTML(value) {

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
   CLOSE MODALS WHEN CLICKING OUTSIDE
   ========================================================= */

window.addEventListener(
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