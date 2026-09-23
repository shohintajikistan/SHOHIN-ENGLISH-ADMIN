/* =========================================================
   SHOHIN ENGLISH — LEVELS
   Supabase + Levels Management
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

(function () {
    "use strict";

    const supabase = window.supabaseClient;

    if (!supabase) {
        console.error("Supabase client not found.");
        return;
    }

    const levelList = document.getElementById("level-list");
    const levelSelect = document.getElementById("level-select");

    async function loadLevels() {
        try {
            const { data, error } = await supabase
                .from("levels")
                .select("*")
                .order("sort_order", { ascending: true });

            if (error) {
                console.error("Could not load levels:", error);

                if (window.showAdminMessage) {
                    window.showAdminMessage(
                        "Could not load levels: " + error.message,
                        "error"
                    );
                }

                return;
            }

            console.log("Levels loaded:", data);

            renderLevels(data);
            fillLevelSelects(data);

        } catch (error) {
            console.error("Levels error:", error);

            if (window.showAdminMessage) {
                window.showAdminMessage(
                    "Levels error: " + error.message,
                    "error"
                );
            }
        }
    }

    function renderLevels(levels) {
        if (!levelList) {
            console.error("Element #level-list not found.");
            return;
        }

        if (!levels || levels.length === 0) {
            levelList.innerHTML = `
                <div class="empty-state">
                    No levels found.
                </div>
            `;
            return;
        }

        levelList.innerHTML = levels.map(function (level) {
            return `
                <div class="level-item">
                    <div>
                        <strong>${escapeHtml(level.code || "")}</strong>
                        <span>${escapeHtml(level.name || "")}</span>
                    </div>

                    <div>
                        <small>
                            ${escapeHtml(level.description || "")}
                        </small>
                    </div>
                </div>
            `;
        }).join("");
    }

    function fillLevelSelects(levels) {
        const selects = document.querySelectorAll(
            "#level-select, #add-lesson-level-select, #add-word-level-select, #add-phrase-level-select"
        );

        selects.forEach(function (select) {

            if (!select) return;

            const currentValue = select.value;

            select.innerHTML = `
                <option value="">Select level</option>
            `;

            levels.forEach(function (level) {
                const option = document.createElement("option");

                option.value = level.id;

                option.textContent =
                    level.code + " — " + level.name;

                select.appendChild(option);
            });

            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    window.loadLevels = loadLevels;

    document.addEventListener("DOMContentLoaded", function () {
        loadLevels();
    });

})();
