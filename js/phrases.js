/* =========================================================
   SHOHIN ENGLISH — PHRASES MANAGEMENT
   Supabase + Phrases
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

let phraseLevels = [];
let phraseLessons = [];
let currentPhrases = [];

let selectedPhraseLevelId = null;
let selectedPhraseLessonId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "SHOHIN PHRASES: initialized"
    );

    loadPhraseLevels();

});


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

        const { data, error } =
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


        phraseLevels = data || [];


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
   LEVEL CHANGE
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


        console.log(
            "Selected phrase level:",
            selectedPhraseLevelId
        );


        loadPhraseLessons(
            selectedPhraseLevelId
        );

    }
);


/* =========================================================
   LOAD LESSONS
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

        const { data, error } =
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


        console.log(
            "Phrase lessons:",
            phraseLessons
        );


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
   LESSON CHANGE
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


        console.log(
            "Selected phrase lesson:",
            selectedPhraseLessonId
        );


        loadPhrases(
            selectedPhraseLessonId
        );

    }
);


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

        const { data, error } =
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
                            phrase.english
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


    if (
        !selectedPhraseLessonId
    ) {

        showPhraseMessage(
            "Please select a lesson first.",
            "error"
        );

        return;
    }


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


    const selectedLessonInput =
        document.getElementById(
            "add-phrase-selected-lesson"
        );


    const lesson =
        phraseLessons.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(
                        selectedPhraseLessonId
                    )
                );

            }
        );


    if (
        selectedLessonInput &&
        lesson
    ) {

        selectedLessonInput.value =
            lesson.title;

    }


    resetPhraseForm();


    const sortInput =
        document.getElementById(
            "phrase-sort-order-input"
        );


    if (sortInput) {

        sortInput.value =
            currentPhrases.length + 1;

    }


    modal.classList.add(
        "active"
    );


    console.log(
        "Phrase modal opened."
    );

}


/* =========================================================
   CLOSE MODAL
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
            currentPhrases.length + 1;

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
        !selectedPhraseLessonId
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
        ) ||
        (
            currentPhrases.length + 1
        );


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


    const phraseData = {

        lesson_id:
            Number(
                selectedPhraseLessonId
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
            sortOrder

    };


    console.log(
        "Phrase data:",
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


        closeAddPhraseModal();


        await loadPhrases(
            selectedPhraseLessonId
        );


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
        confirm(
            "Are you sure you want to delete this phrase?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const { error } =
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


        await loadPhrases(
            selectedPhraseLessonId
        );


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