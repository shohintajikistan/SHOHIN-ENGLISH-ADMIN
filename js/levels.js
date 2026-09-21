/* =========================================================
   SHOHIN ENGLISH — ADMIN
   Levels Management
   Supabase
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let adminLevels =
    [];


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadLevels();

    }
);


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLevels() {

    const list =
        document.getElementById(
            "levels-list"
        );


    if (!list) {
        return;
    }


    if (!window.supabaseClient) {

        list.innerHTML = `
            <div class="empty-state">
                Supabase connection error.
            </div>
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
                .select("*")
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "LEVELS ERROR:",
                error
            );

            list.innerHTML = `
                <div class="empty-state">
                    Failed to load levels.
                </div>
            `;

            return;
        }


        adminLevels =
            data || [];


        renderLevels();


    } catch (error) {

        console.error(
            "LEVELS ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER LEVELS
   ========================================================= */

function renderLevels() {

    const list =
        document.getElementById(
            "levels-list"
        );


    if (!list) {
        return;
    }


    if (
        adminLevels.length === 0
    ) {

        list.innerHTML = `
            <div class="empty-state">
                No levels found.
            </div>
        `;

        return;
    }


    list.innerHTML = "";


    adminLevels.forEach(
        function (level) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "level-card";


            item.innerHTML = `

                <div class="level-card-header">

                    <div class="level-code">
                        ${escapeHtml(
                            level.code || ""
                        )}
                    </div>

                    <div class="level-order">
                        #${level.sort_order}
                    </div>

                </div>

                <h3>
                    ${escapeHtml(
                        level.name || ""
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        level.description || ""
                    )}
                </p>

                <div class="level-actions">

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="openEditLevelModal(${level.id})"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deleteLevel(${level.id})"
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


    const dashboardCount =
        document.getElementById(
            "dashboard-levels-count"
        );


    if (dashboardCount) {

        dashboardCount.textContent =
            adminLevels.length;

    }

}


/* =========================================================
   ADD LEVEL MODAL
   ========================================================= */

function openAddLevelModal() {

    const modal =
        document.getElementById(
            "add-level-modal"
        );


    if (!modal) {
        return;
    }


    document.getElementById(
        "level-code-input"
    ).value = "";


    document.getElementById(
        "level-name-input"
    ).value = "";


    document.getElementById(
        "level-description-input"
    ).value = "";


    document.getElementById(
        "level-sort-order-input"
    ).value =
        adminLevels.length + 1;


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE ADD LEVEL
   ========================================================= */

function closeAddLevelModal() {

    const modal =
        document.getElementById(
            "add-level-modal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   ADD LEVEL
   ========================================================= */

async function addLevel() {

    const code =
        document.getElementById(
            "level-code-input"
        ).value.trim();


    const name =
        document.getElementById(
            "level-name-input"
        ).value.trim();


    const description =
        document.getElementById(
            "level-description-input"
        ).value.trim();


    const sortOrder =
        Number(
            document.getElementById(
                "level-sort-order-input"
            ).value
        );


    if (!code || !name) {

        showAdminMessage(
            "Level code and name are required.",
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
                .from("levels")
                .insert([
                    {
                        code: code,
                        name: name,
                        description:
                            description,
                        sort_order:
                            sortOrder
                    }
                ])
                .select()
                .single();


        if (error) {

            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        adminLevels.push(
            data
        );


        adminLevels.sort(
            function (a, b) {
                return a.sort_order -
                    b.sort_order;
            }
        );


        renderLevels();

        closeAddLevelModal();


        showAdminMessage(
            "Level added successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   EDIT LEVEL
   ========================================================= */

function openEditLevelModal(
    id
) {

    const level =
        adminLevels.find(
            function (item) {
                return item.id === id;
            }
        );


    if (!level) {
        return;
    }


    document.getElementById(
        "edit-level-id"
    ).value =
        level.id;


    document.getElementById(
        "edit-level-code"
    ).value =
        level.code || "";


    document.getElementById(
        "edit-level-name"
    ).value =
        level.name || "";


    document.getElementById(
        "edit-level-description"
    ).value =
        level.description || "";


    document.getElementById(
        "edit-level-sort-order"
    ).value =
        level.sort_order || 1;


    const modal =
        document.getElementById(
            "edit-level-modal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );

    }

}


/* =========================================================
   CLOSE EDIT LEVEL
   ========================================================= */

function closeEditLevelModal() {

    const modal =
        document.getElementById(
            "edit-level-modal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

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


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("levels")
                .update({
                    code: code,
                    name: name,
                    description:
                        description,
                    sort_order:
                        sortOrder
                })
                .eq("id", id)
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
            adminLevels.findIndex(
                function (item) {
                    return item.id === id;
                }
            );


        if (index !== -1) {

            adminLevels[index] =
                data;

        }


        adminLevels.sort(
            function (a, b) {
                return a.sort_order -
                    b.sort_order;
            }
        );


        renderLevels();

        closeEditLevelModal();


        showAdminMessage(
            "Level updated successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   DELETE LEVEL
   ========================================================= */

async function deleteLevel(
    id
) {

    if (
        !confirm(
            "Delete this level?"
        )
    ) {

        return;

    }


    try {

        const {
            error
        } =
            await window.supabaseClient
                .from("levels")
                .delete()
                .eq("id", id);


        if (error) {

            showAdminMessage(
                error.message,
                "error"
            );

            return;
        }


        adminLevels =
            adminLevels.filter(
                function (item) {
                    return item.id !== id;
                }
            );


        renderLevels();


        showAdminMessage(
            "Level deleted.",
            "success"
        );


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
   GLOBAL
   ========================================================= */

window.loadLevels =
    loadLevels;

window.renderLevels =
    renderLevels;

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