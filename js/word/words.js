/* =========================================================
   SHOHIN ENGLISH — WORDS MANAGEMENT
   Supabase + Words
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */

let wordLevels = [];
let wordLessons = [];
let currentWords = [];

let selectedWordLevelId = null;
let selectedWordLessonId = null;


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadWordLevels();
});


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadWordLevels() {

    const levelSelect =
        document.getElementById("word-level-select");

    if (!levelSelect) {
        console.error("word-level-select not found.");
        return;
    }

    levelSelect.innerHTML =
        '<option value="">Select Level</option>';

    try {

        const { data, error } = await supabaseClient
            .from("levels")
            .select("id, code, name, sort_order")
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("Error loading word levels:", error);
            showAdminMessage(
                "Could not load levels: " + error.message,
                "error"
            );
            return;
        }

        wordLevels = data || [];

        wordLevels.forEach(level => {

            const option =
                document.createElement("option");

            option.value = level.id;

            option.textContent =
                `${level.code} — ${level.name}`;

            levelSelect.appendChild(option);
        });

        updateWordsDashboard();

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "Could not load levels.",
            "error"
        );
    }
}


/* =========================================================
   LEVEL CHANGE
   ========================================================= */

document.addEventListener("change", event => {

    if (event.target.id !== "word-level-select") {
        return;
    }

    selectedWordLevelId =
        event.target.value
            ? Number(event.target.value)
            : null;

    selectedWordLessonId = null;

    const lessonSelect =
        document.getElementById("word-lesson-select");

    if (!lessonSelect) {
        return;
    }

    lessonSelect.innerHTML =
        '<option value="">Select Lesson</option>';

    lessonSelect.disabled = true;

    clearWordsList();

    if (!selectedWordLevelId) {
        return;
    }

    loadWordLessons(selectedWordLevelId);
});


/* =========================================================
   LOAD LESSONS
   ========================================================= */

async function loadWordLessons(levelId) {

    const lessonSelect =
        document.getElementById("word-lesson-select");

    if (!lessonSelect) {
        return;
    }

    lessonSelect.innerHTML =
        '<option value="">Loading lessons...</option>';

    try {

        const { data, error } = await supabaseClient
            .from("lessons")
            .select("id, title, description, sort_order")
            .eq("level_id", levelId)
            .order("sort_order", { ascending: true });

        if (error) {
            console.error(
                "Error loading word lessons:",
                error
            );

            lessonSelect.innerHTML =
                '<option value="">Could not load lessons</option>';

            showAdminMessage(
                "Could not load lessons: " + error.message,
                "error"
            );

            return;
        }

        wordLessons = data || [];

        lessonSelect.innerHTML =
            '<option value="">Select Lesson</option>';

        if (wordLessons.length === 0) {

            lessonSelect.innerHTML =
                '<option value="">No lessons found</option>';

            lessonSelect.disabled = true;

            return;
        }

        wordLessons.forEach(lesson => {

            const option =
                document.createElement("option");

            option.value = lesson.id;

            option.textContent =
                `${lesson.sort_order}. ${lesson.title}`;

            lessonSelect.appendChild(option);
        });

        lessonSelect.disabled = false;

    } catch (error) {

        console.error(error);

        lessonSelect.innerHTML =
            '<option value="">Could not load lessons</option>';

        showAdminMessage(
            "Could not load lessons.",
            "error"
        );
    }
}


/* =========================================================
   LESSON CHANGE
   ========================================================= */

document.addEventListener("change", event => {

    if (event.target.id !== "word-lesson-select") {
        return;
    }

    selectedWordLessonId =
        event.target.value
            ? Number(event.target.value)
            : null;

    clearWordsList();

    if (!selectedWordLessonId) {
        return;
    }

    loadWords(selectedWordLessonId);
});


/* =========================================================
   LOAD WORDS
   ========================================================= */

async function loadWords(lessonId) {

    const wordsList =
        document.getElementById("words-list");

    if (!wordsList) {
        return;
    }

    wordsList.innerHTML =
        '<div class="loading">Loading words...</div>';

    try {

        const { data, error } = await supabaseClient
            .from("words")
            .select("*")
            .eq("lesson_id", lessonId)
            .order("sort_order", { ascending: true });

        if (error) {

            console.error(
                "Error loading words:",
                error
            );

            wordsList.innerHTML =
                '<div class="empty-state">Could not load words.</div>';

            showAdminMessage(
                "Could not load words: " + error.message,
                "error"
            );

            return;
        }

        currentWords = data || [];

        renderWords();

        updateWordsDashboard();

    } catch (error) {

        console.error(error);

        wordsList.innerHTML =
            '<div class="empty-state">Could not load words.</div>';
    }
}


/* =========================================================
   RENDER WORDS
   ========================================================= */

function renderWords() {

    const wordsList =
        document.getElementById("words-list");

    if (!wordsList) {
        return;
    }

    if (currentWords.length === 0) {

        wordsList.innerHTML = `
            <div class="empty-state">
                <h3>No words yet</h3>
                <p>Add the first vocabulary word to this lesson.</p>
            </div>
        `;

        return;
    }

    wordsList.innerHTML = "";

    currentWords.forEach(word => {

        const card =
            document.createElement("div");

        card.className = "content-card";

        card.innerHTML = `
            <div class="content-card-main">

                <div class="content-card-title">
                    ${escapeHtml(word.english)}
                </div>

                ${
                    word.pronunciation
                        ? `<div class="content-card-meta">
                            /${escapeHtml(word.pronunciation)}/
                           </div>`
                        : ""
                }

                ${
                    word.russian
                        ? `<div>
                            🇷🇺 ${escapeHtml(word.russian)}
                           </div>`
                        : ""
                }

                ${
                    word.tajik
                        ? `<div>
                            🇹🇯 ${escapeHtml(word.tajik)}
                           </div>`
                        : ""
                }

                ${
                    word.example_sentence
                        ? `<div class="content-card-description">
                            ${escapeHtml(word.example_sentence)}
                           </div>`
                        : ""
                }

                ${
                    word.audio_url
                        ? `<div class="content-card-description">
                            🔊 Audio URL added
                           </div>`
                        : ""
                }

                ${
                    word.image_url
                        ? `<div class="content-card-description">
                            🖼 Image URL added
                           </div>`
                        : ""
                }

            </div>

            <div class="content-card-actions">

                <button
                    type="button"
                    class="btn btn-danger"
                    onclick="deleteWord(${word.id})"
                >
                    Delete
                </button>

            </div>
        `;

        wordsList.appendChild(card);
    });
}


/* =========================================================
   OPEN ADD WORD MODAL
   ========================================================= */

function openAddWordModal() {

    if (!selectedWordLessonId) {

        showAdminMessage(
            "Please select a lesson first.",
            "error"
        );

        return;
    }

    const modal =
        document.getElementById("add-word-modal");

    if (!modal) {
        console.error("add-word-modal not found.");
        return;
    }

    const selectedLessonText =
        document.getElementById(
            "add-word-selected-lesson"
        );

    const lesson =
        wordLessons.find(
            item =>
                Number(item.id) ===
                Number(selectedWordLessonId)
        );

    if (selectedLessonText && lesson) {

        selectedLessonText.textContent =
            lesson.title;
    }

    resetWordForm();

    const sortInput =
        document.getElementById(
            "word-sort-order-input"
        );

    if (sortInput) {

        sortInput.value =
            currentWords.length + 1;
    }

    modal.classList.add("active");
}


/* =========================================================
   CLOSE ADD WORD MODAL
   ========================================================= */

function closeAddWordModal() {

    const modal =
        document.getElementById("add-word-modal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
}


/* =========================================================
   RESET WORD FORM
   ========================================================= */

function resetWordForm() {

    const fields = [
        "word-english-input",
        "word-russian-input",
        "word-tajik-input",
        "word-pronunciation-input",
        "word-audio-input",
        "word-image-input",
        "word-example-input"
    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });

    const sortInput =
        document.getElementById(
            "word-sort-order-input"
        );

    if (sortInput) {
        sortInput.value =
            currentWords.length + 1;
    }
}


/* =========================================================
   ADD WORD
   ========================================================= */

async function addWord() {

    if (!selectedWordLessonId) {

        showAdminMessage(
            "Please select a lesson first.",
            "error"
        );

        return;
    }

    const english =
        getInputValue("word-english-input");

    const russian =
        getInputValue("word-russian-input");

    const tajik =
        getInputValue("word-tajik-input");

    const pronunciation =
        getInputValue("word-pronunciation-input");

    const audioUrl =
        getInputValue("word-audio-input");

    const imageUrl =
        getInputValue("word-image-input");

    const exampleSentence =
        getInputValue("word-example-input");

    const sortOrder =
        Number(
            getInputValue("word-sort-order-input")
        ) || currentWords.length + 1;


    if (!english) {

        showAdminMessage(
            "English word is required.",
            "error"
        );

        return;
    }


    const wordData = {

        lesson_id:
            Number(selectedWordLessonId),

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

        image_url:
            imageUrl || null,

        example_sentence:
            exampleSentence || null,

        sort_order:
            sortOrder
    };


    try {

        const { data, error } =
            await supabaseClient
                .from("words")
                .insert(wordData)
                .select()
                .single();


        if (error) {

            console.error(
                "Error adding word:",
                error
            );

            showAdminMessage(
                "Could not add word: " +
                error.message,
                "error"
            );

            return;
        }


        console.log(
            "Word added:",
            data
        );


        closeAddWordModal();

        await loadWords(
            selectedWordLessonId
        );


        showAdminMessage(
            "Word added successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "Could not add word.",
            "error"
        );
    }
}


/* =========================================================
   DELETE WORD
   ========================================================= */

async function deleteWord(wordId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this word?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const { error } =
            await supabaseClient
                .from("words")
                .delete()
                .eq("id", wordId);


        if (error) {

            console.error(
                "Error deleting word:",
                error
            );

            showAdminMessage(
                "Could not delete word: " +
                error.message,
                "error"
            );

            return;
        }


        await loadWords(
            selectedWordLessonId
        );


        showAdminMessage(
            "Word deleted successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showAdminMessage(
            "Could not delete word.",
            "error"
        );
    }
}


/* =========================================================
   DASHBOARD WORD COUNT
   ========================================================= */

async function updateWordsDashboard() {

    const countElement =
        document.getElementById(
            "dashboard-words-count"
        );

    if (!countElement) {
        return;
    }


    try {

        const { count, error } =
            await supabaseClient
                .from("words")
                .select("*", {
                    count: "exact",
                    head: true
                });


        if (error) {

            console.error(
                "Could not count words:",
                error
            );

            return;
        }


        countElement.textContent =
            count ?? 0;

    } catch (error) {

        console.error(error);
    }
}


/* =========================================================
   CLEAR WORDS LIST
   ========================================================= */

function clearWordsList() {

    const wordsList =
        document.getElementById(
            "words-list"
        );

    if (!wordsList) {
        return;
    }

    wordsList.innerHTML = `
        <div class="empty-state">
            Select a lesson to view words.
        </div>
    `;

    currentWords = [];
}


/* =========================================================
   GET INPUT VALUE
   ========================================================= */

function getInputValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    if (value === null || value === undefined) {
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
   ADMIN MESSAGE
   ========================================================= */

function showAdminMessage(message, type = "success") {

    if (
        typeof window.showMessage === "function"
    ) {
        window.showMessage(
            message,
            type
        );

        return;
    }

    console.log(
        `[${type}] ${message}`
    );
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openAddWordModal =
    openAddWordModal;

window.closeAddWordModal =
    closeAddWordModal;

window.addWord =
    addWord;

window.deleteWord =
    deleteWord;

window.loadWords =
    loadWords;
