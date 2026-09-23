```javascript
/* =========================================================
   SHOHIN ENGLISH — PHRASES MANAGEMENT
   Supabase + Phrases
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let phraseLevels = [];
let phraseLessons = [];
let currentPhrases = [];

let selectedPhraseLevelId = null;
let selectedPhraseLessonId = null;

/*
   Variables used by Add Phrase modal
*/
let addPhraseLevelId = null;
let addPhraseLessonId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "SHOHIN PHRASES: initialized"
        );

        loadPhraseLevels();

    }
);


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadPhraseLevels() {

    const levelSelect =
        document.getElementById(
            "phrase-level-select"
        );

    if (!levelSelect) {

        console.error(
            "phrase-level-select not found."
        );

        return;
    }

    if (!window.supabaseClient) {

        console.error(
            "Supabase client not found."
        );

        showPhraseMessage(
            "Supabase connection is not ready.",
            "error"
        );

        return;
    }

    levelSelect.innerHTML =
        '<option value="">Select Level</option>';

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
                "Error loading levels:",
                error
            );

            showPhraseMessage(
                "Could not load levels: " +
                error.message,
                "error"
            );

            return;
        }

        phraseLevels =
            data || [];

        phraseLevels.forEach(
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

                levelSelect.appendChild(
                    option
                );

            }
        );

        populateAddPhraseLevelSelect();

        updatePhrasesDashboard();

        console.log(
            "PHRASE LEVELS:",
            phraseLevels
        );

    } catch (error) {

        console.error(
            "Could not load phrase levels:",
            error
        );

        showPhraseMessage(
            "Could not load levels.",
            "error"
        );

    }

}


/* =========================================================
   POPULATE ADD PHRASE LEVEL SELECT
   ========================================================= */

function populateAddPhraseLevelSelect() {

    const select =
        document.getElementById(
            "add-phrase-level-select"
        );

    if (!select) {

        console.error(
            "add-phrase-level-select not found."
        );

        return;
    }

    select.innerHTML =
        '<option value="">Select Level</option>';

    phraseLevels.forEach(
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

}


/* =========================================================
   MAIN PAGE LEVEL CHANGE
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id !==
            "phrase-level-select"
        ) {

            return;
        }

        selectedPhraseLevelId =
            event.target.value
                ? Number(
                    event.target.value
                )
                : null;

        selectedPhraseLessonId =
            null;

        const lessonSelect =
            document.getElementById(
                "phrase-lesson-select"
            );

        if (!lessonSelect) {

            console.error(
                "phrase-lesson-select not found."
            );

            return;
        }

        lessonSelect.innerHTML =
            '<option value="">Select Lesson</option>';

        lessonSelect.disabled =
            true;

        clearPhrasesList();

        if (
            !selectedPhraseLevelId
        ) {

            return;
        }

        loadPhraseLessons(
            selectedPhraseLevelId
        );

    }
);


/* =========================================================
   MAIN PAGE LESSON CHANGE
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id !==
            "phrase-lesson-select"
        ) {

            return;
        }

        selectedPhraseLessonId =
            event.target.value
                ? Number(
                    event.target.value
                )
                : null;

        clearPhrasesList();

        if (
            !selectedPhraseLessonId
        ) {

            return;
        }

        loadPhrases(
            selectedPhraseLessonId
        );

    }
);


/* =========================================================
   LOAD MAIN PAGE LESSONS
   ========================================================= */

async function loadPhraseLessons(
    levelId
) {

    const lessonSelect =
        document.getElementById(
            "phrase-lesson-select"
        );

    if (!lessonSelect) {
        return;
    }

    lessonSelect.innerHTML =
        '<option value="">Loading lessons...</option>';

    lessonSelect.disabled =
        true;

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("lessons")
                .select(
                    "id, title, description, sort_order"
                )
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
                "Error loading lessons:",
                error
            );

            lessonSelect.innerHTML =
                '<option value="">Could not load lessons</option>';

            showPhraseMessage(
                "Could not load lessons: " +
                error.message,
                "error"
            );

            return;
        }

        phraseLessons =
            data || [];

        lessonSelect.innerHTML =
            '<option value="">Select Lesson</option>';

        if (
            phraseLessons.length === 0
        ) {

            lessonSelect.innerHTML =
                '<option value="">No lessons found</option>';

            lessonSelect.disabled =
                true;

            return;
        }

        phraseLessons.forEach(
            function (lesson) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    lesson.id;

                option.textContent =
                    lesson.sort_order +
                    ". " +
                    lesson.title;

                lessonSelect.appendChild(
                    option
                );

            }
        );

        lessonSelect.disabled =
            false;

    } catch (error) {

        console.error(
            error
        );

        lessonSelect.innerHTML =
            '<option value="">Could not load lessons</option>';

        showPhraseMessage(
            "Could not load lessons.",
            "error"
        );

    }

}


/* =========================================================
   LOAD PHRASES
   ========================================================= */

async function loadPhrases(
    lessonId
) {

    const phrasesList =
        document.getElementById(
            "phrases-list"
        );

    if (!phrasesList) {
        return;
    }

    phrasesList.innerHTML =
        '<div class="loading-state">Loading phrases...</div>';

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("phrases")
                .select("*")
                .eq(
                    "lesson_id",
                    lessonId
                )
                .order(
                    "sort_order",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "Error loading phrases:",
                error
            );

            phrasesList.innerHTML =
                '<div class="empty-state">Could not load phrases.</div>';

            showPhraseMessage(
                "Could not load phrases: " +
                error.message,
                "error"
            );

            return;
        }

        currentPhrases =
            data || [];

        renderPhrases();

        updatePhrasesDashboard();

    } catch (error) {

        console.error(
            error
        );

        phrasesList.innerHTML =
            '<div class="empty-state">Could not load phrases.</div>';

        showPhraseMessage(
            "Could not load phrases.",
            "error"
        );

    }

}


/* =========================================================
   RENDER PHRASES
   ========================================================= */

function renderPhrases() {

    const phrasesList =
        document.getElementById(
            "phrases-list"
        );

    if (!phrasesList) {
        return;
    }

    if (
        currentPhrases.length === 0
    ) {

        phrasesList.innerHTML = `

            <div class="empty-state">

                <h3>
                    No phrases yet
                </h3>

                <p>
                    Add the first phrase to this lesson.
                </p>

            </div>

        `;

        return;
    }

    phrasesList.innerHTML =
        "";

    currentPhrases.forEach(
        function (phrase) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "content-card";

            card.innerHTML = `

                <div class="content-card-main">

                    <div class="content-card-title">

                        ${escapePhraseHtml(
                            phrase.english ||
                            phrase.phrase ||
                            ""
                        )}

                    </div>

                    ${
                        phrase.pronunciation
                            ? `
                                <div class="content-card-meta">
                                    /${escapePhraseHtml(
                                        phrase.pronunciation
                                    )}/
                                </div>
                            `
                            : ""
                    }

                    ${
                        phrase.russian
                            ? `
                                <div>
                                    🇷🇺
                                    ${escapePhraseHtml(
                                        phrase.russian
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${
                        phrase.tajik
                            ? `
                                <div>
                                    🇹🇯
                                    ${escapePhraseHtml(
                                        phrase.tajik
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${
                        phrase.example_sentence
                            ? `
                                <div class="content-card-description">
                                    ${escapePhraseHtml(
                                        phrase.example_sentence
                                    )}
                                </div>
                            `
                            : ""
                    }

                    ${
                        phrase.audio_url
                            ? `
                                <div class="content-card-description">
                                    🔊 Audio URL added
                                </div>
                            `
                            : ""
                    }

                </div>

                <div class="content-card-actions">

                    <button
                        type="button"
                        class="btn btn-danger"
                        onclick="deletePhrase(${phrase.id})"
                    >
                        Delete
                    </button>

                </div>

            `;

            phrasesList.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   OPEN ADD PHRASE MODAL
   ========================================================= */

function openAddPhraseModal() {

    console.log(
        "OPEN ADD PHRASE MODAL"
    );

    const modal =
        document.getElementById(
            "add-phrase-modal"
        );

    if (!modal) {

        alert(
            "ERROR: add-phrase-modal not found."
        );

        console.error(
            "add-phrase-modal not found."
        );

        return;
    }

    addPhraseLevelId =
        null;

    addPhraseLessonId =
        null;

    const levelSelect =
        document.getElementById(
            "add-phrase-level-select"
        );

    const lessonSelect =
        document.getElementById(
            "add-phrase-lesson-select"
        );

    const selectedLessonBox =
        document.getElementById(
            "add-phrase-selected-lesson"
        );

    if (levelSelect) {

        levelSelect.value =
            "";

    }

    if (lessonSelect) {

        lessonSelect.innerHTML =
            '<option value="">Select Lesson</option>';

        lessonSelect.disabled =
            true;

    }

    if (selectedLessonBox) {

        selectedLessonBox.textContent =
            "No lesson selected";

    }

    resetPhraseForm();

    const sortInput =
        document.getElementById(
            "phrase-sort-order-input"
        );

    if (sortInput) {

        sortInput.value =
            "1";

    }

    if (
        phraseLevels.length === 0
    ) {

        loadPhraseLevels();

    }

    modal.classList.add(
        "active"
    );

    modal.style.display =
        "flex";

    modal.style.visibility =
        "visible";

    modal.style.opacity =
        "1";

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    console.log(
        "Phrase modal opened."
    );

}


/* =========================================================
   ADD PHRASE MODAL LEVEL CHANGE
   ========================================================= */

document.addEventListener(
    "change",
    async function (event) {

        if (
            event.target.id !==
            "add-phrase-level-select"
        ) {

            return;
        }

        addPhraseLevelId =
            event.target.value
                ? Number(
                    event.target.value
                )
                : null;

        addPhraseLessonId =
            null;

        const lessonSelect =
            document.getElementById(
                "add-phrase-lesson-select"
            );

        const selectedLessonBox =
            document.getElementById(
                "add-phrase-selected-lesson"
            );

        if (lessonSelect) {

            lessonSelect.innerHTML =
                '<option value="">Select Lesson</option>';

            lessonSelect.disabled =
                true;

        }

        if (selectedLessonBox) {

            selectedLessonBox.textContent =
                "No lesson selected";

        }

        if (
            !addPhraseLevelId
        ) {

            return;
        }

        await loadAddPhraseLessons(
            addPhraseLevelId
        );

    }
);


/* =========================================================
   LOAD LESSONS INSIDE ADD PHRASE MODAL
   ========================================================= */

async function loadAddPhraseLessons(
    levelId
) {

    const lessonSelect =
        document.getElementById(
            "add-phrase-lesson-select"
        );

    if (!lessonSelect) {

        console.error(
            "add-phrase-lesson-select not found."
        );

        return;
    }

    lessonSelect.innerHTML =
        '<option value="">Loading lessons...</option>';

    lessonSelect.disabled =
        true;

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("lessons")
                .select(
                    "id, title, description, sort_order"
                )
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
                "ADD PHRASE LESSON ERROR:",
                error
            );

            lessonSelect.innerHTML =
                '<option value="">Could not load lessons</option>';

            alert(
                "Could not load lessons:\n\n" +
                error.message
            );

            return;
        }

        lessonSelect.innerHTML =
            '<option value="">Select Lesson</option>';

        if (
            !data ||
            data.length === 0
        ) {

            lessonSelect.innerHTML =
                '<option value="">No lessons found</option>';

            lessonSelect.disabled =
                true;

            return;
        }

        data.forEach(
            function (lesson) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    lesson.id;

                option.textContent =
                    lesson.sort_order +
                    ". " +
                    lesson.title;

                lessonSelect.appendChild(
                    option
                );

            }
        );

        lessonSelect.disabled =
            false;

    } catch (error) {

        console.error(
            "ADD PHRASE LESSON EXCEPTION:",
            error
        );

        lessonSelect.innerHTML =
            '<option value="">Could not load lessons</option>';

        alert(
            "Could not load lessons:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   ADD PHRASE MODAL LESSON CHANGE
   ========================================================= */

document.addEventListener(
    "change",
    function (event) {

        if (
            event.target.id !==
            "add-phrase-lesson-select"
        ) {

            return;
        }

        addPhraseLessonId =
            event.target.value
                ? Number(
                    event.target.value
                )
                : null;

        const selectedLessonBox =
            document.getElementById(
                "add-phrase-selected-lesson"
            );

        const selectedOption =
            event.target.options[
                event.target.selectedIndex
            ];

        if (
            selectedLessonBox &&
            addPhraseLessonId &&
            selectedOption
        ) {

            selectedLessonBox.textContent =
                selectedOption.textContent;

        } else if (
            selectedLessonBox
        ) {

            selectedLessonBox.textContent =
                "No lesson selected";

        }

        if (
            addPhraseLessonId
        ) {

            loadAddPhraseSortOrder(
                addPhraseLessonId
            );

        }

    }
);


/* =========================================================
   LOAD NEXT SORT ORDER
   ========================================================= */

async function loadAddPhraseSortOrder(
    lessonId
) {

    const sortInput =
        document.getElementById(
            "phrase-sort-order-input"
        );

    if (!sortInput) {
        return;
    }

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("phrases")
                .select("sort_order")
                .eq(
                    "lesson_id",
                    lessonId
                )
                .order(
                    "sort_order",
                    {
                        ascending: false
                    }
                )
                .limit(1);

        if (error) {

            console.error(
                "SORT ORDER ERROR:",
                error
            );

            sortInput.value =
                "1";

            return;
        }

        if (
            data &&
            data.length > 0
        ) {

            const lastOrder =
                Number(
                    data[0].sort_order
                ) || 0;

            sortInput.value =
                String(
                    lastOrder + 1
                );

        } else {

            sortInput.value =
                "1";

        }

    } catch (error) {

        console.error(
            error
        );

        sortInput.value =
            "1";

    }

}


/* =========================================================
   CLOSE ADD PHRASE MODAL
   ========================================================= */

function closeAddPhraseModal() {

    const modal =
        document.getElementById(
            "add-phrase-modal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    modal.style.display =
        "none";

    modal.style.visibility =
        "hidden";

    modal.style.opacity =
        "0";

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   RESET FORM
   ========================================================= */

function resetPhraseForm() {

    const fields = [

        "phrase-english-input",

        "phrase-russian-input",

        "phrase-tajik-input",

        "phrase-pronunciation-input",

        "phrase-audio-input",

        "phrase-example-input"

    ];

    fields.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value =
                    "";

            }

        }
    );

    const sortInput =
        document.getElementById(
            "phrase-sort-order-input"
        );

    if (sortInput) {

        sortInput.value =
            "1";

    }

}


/* =========================================================
   ADD PHRASE
   ========================================================= */

async function addPhrase() {

    console.log(
        "ADD PHRASE START"
    );

    if (
        !addPhraseLevelId
    ) {

        alert(
            "Please select a level first."
        );

        return;
    }

    if (
        !addPhraseLessonId
    ) {

        alert(
            "Please select a lesson first."
        );

        return;
    }

    const english =
        getPhraseInput(
            "phrase-english-input"
        );

    const russian =
        getPhraseInput(
            "phrase-russian-input"
        );

    const tajik =
        getPhraseInput(
            "phrase-tajik-input"
        );

    const pronunciation =
        getPhraseInput(
            "phrase-pronunciation-input"
        );

    const audioUrl =
        getPhraseInput(
            "phrase-audio-input"
        );

    const exampleSentence =
        getPhraseInput(
            "phrase-example-input"
        );

    const sortOrder =
        Number(
            getPhraseInput(
                "phrase-sort-order-input"
            )
        ) || 1;

    if (!english) {

        alert(
            "English phrase is required."
        );

        return;
    }

    if (!window.supabaseClient) {

        alert(
            "Supabase connection is not available."
        );

        console.error(
            "supabaseClient missing."
        );

        return;
    }


    /*
       IMPORTANT

       Your current Supabase table contains
       both the new fields and old legacy fields.

       New structure:
       lesson_id
       english
       russian
       tajik

       Legacy structure:
       level_id
       phrase
       translation

       We fill both so the existing table
       can work correctly.
    */

    const phraseData = {

        /* NEW STRUCTURE */

        lesson_id:
            Number(
                addPhraseLessonId
            ),

        english:
            english,

        russian:
            russian || null,

        tajik:
            tajik || null,

        pronunciation:
            pronunciation || null,

        audio_url:
            audioUrl || null,

        example_sentence:
            exampleSentence || null,

        sort_order:
            sortOrder,


        /* OLD / LEGACY STRUCTURE */

        level_id:
            Number(
                addPhraseLevelId
            ),

        phrase:
            english,

        translation:
            russian ||
            tajik ||
            null

    };


    console.log(
        "PHRASE DATA TO INSERT:",
        phraseData
    );


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient
                .from("phrases")
                .insert(
                    phraseData
                )
                .select()
                .single();


        if (error) {

            console.error(
                "SUPABASE ADD PHRASE ERROR:",
                error
            );

            alert(
                "Could not add phrase:\n\n" +
                error.message
            );

            showPhraseMessage(
                "Could not add phrase: " +
                error.message,
                "error"
            );

            return;
        }


        console.log(
            "PHRASE ADDED SUCCESSFULLY:",
            data
        );


        selectedPhraseLevelId =
            Number(
                addPhraseLevelId
            );

        selectedPhraseLessonId =
            Number(
                addPhraseLessonId
            );


        closeAddPhraseModal();


        /*
           Refresh phrase list
        */

        await loadPhrases(
            selectedPhraseLessonId
        );


        /*
           Refresh dashboard
        */

        await updatePhrasesDashboard();


        showPhraseMessage(
            "Phrase added successfully.",
            "success"
        );


        alert(
            "Phrase added successfully!"
        );


    } catch (error) {

        console.error(
            "ADD PHRASE EXCEPTION:",
            error
        );

        alert(
            "Could not add phrase:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   DELETE PHRASE
   ========================================================= */

async function deletePhrase(
    phraseId
) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this phrase?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } =
            await window.supabaseClient
                .from("phrases")
                .delete()
                .eq(
                    "id",
                    phraseId
                );

        if (error) {

            console.error(
                "Error deleting phrase:",
                error
            );

            alert(
                "Could not delete phrase:\n\n" +
                error.message
            );

            return;
        }

        if (
            selectedPhraseLessonId
        ) {

            await loadPhrases(
                selectedPhraseLessonId
            );

        }

        await updatePhrasesDashboard();

        showPhraseMessage(
            "Phrase deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Could not delete phrase:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   DASHBOARD COUNT
   ========================================================= */

async function updatePhrasesDashboard() {

    const countElement =
        document.getElementById(
            "dashboard-phrases-count"
        );

    if (!countElement) {
        return;
    }

    try {

        const {
            count,
            error
        } =
            await window.supabaseClient
                .from("phrases")
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                );

        if (error) {

            console.error(
                "Could not count phrases:",
                error
            );

            return;
        }

        countElement.textContent =
            count ?? 0;

    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   CLEAR LIST
   ========================================================= */

function clearPhrasesList() {

    const phrasesList =
        document.getElementById(
            "phrases-list"
        );

    if (!phrasesList) {
        return;
    }

    phrasesList.innerHTML = `

        <div class="empty-state">

            Select a lesson to view phrases.

        </div>

    `;

    currentPhrases =
        [];

}


/* =========================================================
   GET INPUT
   ========================================================= */

function getPhraseInput(
    id
) {

    const element =
        document.getElementById(
            id
        );

    if (!element) {

        console.error(
            "Input not found:",
            id
        );

        return "";
    }

    return (
        element.value || ""
    ).trim();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapePhraseHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

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
   MESSAGE
   ========================================================= */

function showPhraseMessage(
    message,
    type = "success"
) {

    if (
        typeof window.showAdminMessage ===
        "function"
    ) {

        window.showAdminMessage(
            message,
            type
        );

        return;
    }

    console.log(
        "[" +
        type +
        "] " +
        message
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openAddPhraseModal =
    openAddPhraseModal;

window.closeAddPhraseModal =
    closeAddPhraseModal;

window.addPhrase =
    addPhrase;

window.deletePhrase =
    deletePhrase;

window.loadPhrases =
    loadPhrases;

window.loadPhraseLevels =
    loadPhraseLevels;
```
