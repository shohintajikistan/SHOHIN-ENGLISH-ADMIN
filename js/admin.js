/* =========================================================
   SHOHIN ENGLISH — ADMIN PANEL
   Supabase + Levels + Lessons
   SHOHIN BRAND COLORS — НЕ МЕНЯТЬ
   ========================================================= */


/* =========================================================
   SUPABASE SETTINGS
   ========================================================= */

const SUPABASE_URL =
  "https://axialbwwmablgrbqwpkc.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aWFsYnd3bWFibGdyYnF3cGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4ODI5MTMsImV4cCI6MjEwNTQ1ODkxM30.OZ6mkKZZxj_kGsRdD1USvumYV2PQ-5BPshnpOWBVrJs";


let supabaseClient = null;


/* =========================================================
   INITIALIZE SUPABASE
   ========================================================= */

function initializeSupabase() {

  if (
    typeof window.supabase === "undefined"
  ) {

    console.error(
      "Supabase library не загружена."
    );

    return false;
  }


  try {

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );


    console.log(
      "SHOHIN ENGLISH — Supabase initialized."
    );


    return true;

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    return false;

  }

}


/* =========================================================
   SECTION TITLES
   ========================================================= */

const sectionTitles = {

  dashboard: "Dashboard",

  levels: "Levels",

  lessons: "Lessons",

  vocabulary: "Vocabulary",

  phrases: "Phrases",

  exercises: "Exercises",

  videos: "Videos",

  tests: "Tests"

};


/* =========================================================
   NAVIGATION
   ========================================================= */

function openSection(
  sectionName
) {

  const sections =
    document.querySelectorAll(
      ".admin-section"
    );


  sections.forEach(
    (section) => {

      section.classList.remove(
        "active"
      );

    }
  );


  const target =
    document.getElementById(
      `section-${sectionName}`
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  const title =
    document.getElementById(
      "page-title"
    );


  if (title) {

    title.textContent =
      sectionTitles[
        sectionName
      ] ||
      "SHOHIN ENGLISH";

  }


  const navItems =
    document.querySelectorAll(
      ".nav-item"
    );


  navItems.forEach(
    (item) => {

      item.classList.remove(
        "active"
      );

    }
  );


  const activeNav =
    document.querySelector(
      `.nav-item[data-section="${sectionName}"]`
    );


  if (activeNav) {

    activeNav.classList.add(
      "active"
    );

  }


  localStorage.setItem(
    "shohin_admin_last_section",
    sectionName
  );


  if (
    sectionName ===
    "levels"
  ) {

    loadLevels();

  }


  if (
    sectionName ===
    "lessons"
  ) {

    initializeLessons();

  }


  const sidebar =
    document.querySelector(
      ".sidebar"
    );


  if (
    sidebar &&
    window.innerWidth <= 900
  ) {

    sidebar.classList.remove(
      "open"
    );

  }

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function toggleSidebar() {

  const sidebar =
    document.querySelector(
      ".sidebar"
    );


  if (sidebar) {

    sidebar.classList.toggle(
      "open"
    );

  }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   UPDATE DASHBOARD
   ========================================================= */

async function updateDashboard() {

  if (!supabaseClient) {
    return;
  }


  try {

    const levelsResult =
      await supabaseClient
        .from("levels")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );


    const lessonsResult =
      await supabaseClient
        .from("lessons")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );


    const cardsResult =
      await supabaseClient
        .from("cards")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        );


    const phraseResult =
      await supabaseClient
        .from("cards")
        .select(
          "id",
          {
            count: "exact",
            head: true
          }
        )
        .not(
          "phrase",
          "is",
          null
        );


    const levelCount =
      document.getElementById(
        "stat-levels"
      );


    const lessonCount =
      document.getElementById(
        "stat-lessons"
      );


    const wordCount =
      document.getElementById(
        "stat-words"
      );


    const phraseCount =
      document.getElementById(
        "stat-phrases"
      );


    if (levelCount) {

      levelCount.textContent =
        levelsResult.count ||
        0;

    }


    if (lessonCount) {

      lessonCount.textContent =
        lessonsResult.count ||
        0;

    }


    if (wordCount) {

      wordCount.textContent =
        cardsResult.count ||
        0;

    }


    if (phraseCount) {

      phraseCount.textContent =
        phraseResult.count ||
        0;

    }

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* =========================================================
   SUPABASE CONNECTION TEST
   ========================================================= */

async function testSupabaseConnection() {

  const status =
    document.getElementById(
      "supabase-status"
    );


  const dashboardStatus =
    document.getElementById(
      "dashboard-supabase-status"
    );


  if (!supabaseClient) {

    setConnectionStatus(
      status,
      false,
      "Not connected"
    );


    setConnectionStatus(
      dashboardStatus,
      false,
      "Not connected"
    );


    return false;

  }


  try {

    const {
      error
    } = await supabaseClient
      .from("levels")
      .select("id")
      .limit(1);


    if (error) {

      console.error(
        "Supabase connection error:",
        error
      );


      setConnectionStatus(
        status,
        false,
        "Connection error"
      );


      setConnectionStatus(
        dashboardStatus,
        false,
        "Connection error"
      );


      return false;

    }


    console.log(
      "✅ SHOHIN ENGLISH — Supabase connected!"
    );


    setConnectionStatus(
      status,
      true,
      "Connected"
    );


    setConnectionStatus(
      dashboardStatus,
      true,
      "Connected"
    );


    return true;

  } catch (error) {

    console.error(
      "Supabase request failed:",
      error
    );


    setConnectionStatus(
      status,
      false,
      "Connection error"
    );


    setConnectionStatus(
      dashboardStatus,
      false,
      "Connection error"
    );


    return false;

  }

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(
  element,
  connected,
  text
) {

  if (!element) {
    return;
  }


  element.textContent =
    text;


  element.classList.remove(
    "success",
    "error"
  );


  element.classList.add(
    connected
      ? "success"
      : "error"
  );

}


/* =========================================================
   LOAD LEVELS
   ========================================================= */

async function loadLevels() {

  const container =
    document.getElementById(
      "levels-list"
    );


  if (!container) {
    return;
  }


  container.innerHTML = `
    <div class="empty-state">
      Loading levels...
    </div>
  `;


  if (!supabaseClient) {

    container.innerHTML = `
      <div class="empty-state">
        Supabase is not connected.
      </div>
    `;

    return;

  }


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
        "Cannot load levels:",
        error
      );


      container.innerHTML = `
        <div class="empty-state">
          Error loading levels.
          <br>
          <small>
            ${escapeHtml(
              error.message
            )}
          </small>
        </div>
      `;

      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `
        <div class="empty-state">
          No levels found.
        </div>
      `;

      return;

    }


    renderLevels(
      data
    );

  } catch (error) {

    console.error(
      "Levels error:",
      error
    );


    container.innerHTML = `
      <div class="empty-state">
        Something went wrong.
      </div>
    `;

  }

}


/* =========================================================
   RENDER LEVELS
   ========================================================= */

function renderLevels(
  levels
) {

  const container =
    document.getElementById(
      "levels-list"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  levels.forEach(
    (level) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "level-item";


      item.innerHTML = `

        <div class="level-main">

          <div class="level-code">

            ${escapeHtml(
              level.code
            )}

          </div>


          <div class="level-info">

            <strong>

              ${escapeHtml(
                level.name
              )}

            </strong>


            <span>

              ${escapeHtml(
                level.description ||
                ""
              )}

            </span>

          </div>

        </div>


        <div class="level-actions">

          <button
            type="button"
            class="level-edit"
            onclick="
              SHOHIN_ADMIN.editLevel(
                ${level.id}
              )
            "
          >
            Edit
          </button>


          <button
            type="button"
            class="level-delete"
            onclick="
              SHOHIN_ADMIN.deleteLevel(
                ${level.id}
              )
            "
          >
            Delete
          </button>

        </div>

      `;


      container.appendChild(
        item
      );

    }
  );


  injectLevelStyles();

}


/* =========================================================
   ADD LEVEL
   ========================================================= */

async function addLevel() {

  if (!supabaseClient) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const code =
    prompt(
      "Level code:\nExample: A1"
    );


  if (
    !code ||
    !code.trim()
  ) {
    return;
  }


  const name =
    prompt(
      "Level name:\nExample: Beginner"
    );


  if (
    !name ||
    !name.trim()
  ) {
    return;
  }


  const description =
    prompt(
      "Description:"
    );


  const sortOrder =
    prompt(
      "Sort order:",
      "1"
    );


  try {

    const {
      error
    } = await supabaseClient
      .from("levels")
      .insert([
        {

          code:
            code
              .trim()
              .toUpperCase(),

          name:
            name.trim(),

          description:
            description
              ? description.trim()
              : "",

          sort_order:
            Number(
              sortOrder
            ) || 0

        }
      ]);


    if (error) {

      console.error(
        "Add level error:",
        error
      );


      alert(
        "Error adding level:\n" +
        error.message
      );

      return;

    }


    await loadLevels();

    await updateDashboard();


    alert(
      "Level added successfully."
    );

  } catch (error) {

    console.error(
      "Add level failed:",
      error
    );


    alert(
      "Something went wrong."
    );

  }

}


/* =========================================================
   EDIT LEVEL
   ========================================================= */

async function editLevel(
  id
) {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("levels")
      .select("*")
      .eq(
        "id",
        id
      )
      .single();


    if (error) {

      alert(
        "Cannot load level:\n" +
        error.message
      );

      return;

    }


    const newCode =
      prompt(
        "Level code:",
        data.code || ""
      );


    if (
      !newCode ||
      !newCode.trim()
    ) {
      return;
    }


    const newName =
      prompt(
        "Level name:",
        data.name || ""
      );


    if (
      !newName ||
      !newName.trim()
    ) {
      return;
    }


    const newDescription =
      prompt(
        "Description:",
        data.description || ""
      );


    const newSortOrder =
      prompt(
        "Sort order:",
        data.sort_order || 0
      );


    const {
      error: updateError
    } = await supabaseClient
      .from("levels")
      .update({

        code:
          newCode
            .trim()
            .toUpperCase(),

        name:
          newName.trim(),

        description:
          newDescription
            ? newDescription.trim()
            : "",

        sort_order:
          Number(
            newSortOrder
          ) || 0

      })
      .eq(
        "id",
        id
      );


    if (updateError) {

      alert(
        "Error updating level:\n" +
        updateError.message
      );

      return;

    }


    await loadLevels();

    await updateDashboard();

  } catch (error) {

    console.error(
      "Edit level failed:",
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

  if (!supabaseClient) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this level?\n\n" +
      "Lessons and cards inside this " +
      "level may also be deleted."
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
        id
      );


    if (error) {

      alert(
        "Error deleting level:\n" +
        error.message
      );

      return;

    }


    await loadLevels();

    await updateDashboard();

  } catch (error) {

    console.error(
      "Delete level failed:",
      error
    );

  }

}


/* =========================================================
   LESSONS — LOAD LEVEL SELECT
   ========================================================= */

async function loadLessonLevels() {

  const select =
    document.getElementById(
      "lesson-level-select"
    );


  if (!select) {
    return;
  }


  if (!supabaseClient) {

    select.innerHTML = `
      <option value="">
        Supabase not connected
      </option>
    `;

    return;

  }


  try {

    const {
      data,
      error
    } = await supabaseClient
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
        "Cannot load lesson levels:",
        error
      );


      select.innerHTML = `
        <option value="">
          Error loading levels
        </option>
      `;

      return;

    }


    select.innerHTML = `
      <option value="">
        Select level
      </option>
    `;


    (data || []).forEach(
      (level) => {

        const option =
          document.createElement(
            "option"
          );


        option.value =
          level.id;


        option.textContent =
          `${level.code} — ${level.name}`;


        select.appendChild(
          option
        );

      }
    );


  } catch (error) {

    console.error(
      "Lesson level error:",
      error
    );

  }

}


/* =========================================================
   LESSONS — LOAD
   ========================================================= */

async function loadLessons() {

  const container =
    document.getElementById(
      "lessons-list"
    );


  const select =
    document.getElementById(
      "lesson-level-select"
    );


  if (
    !container ||
    !select
  ) {
    return;
  }


  const levelId =
    select.value;


  if (!levelId) {

    container.innerHTML = `
      <div class="empty-state">
        Select a level to view lessons.
      </div>
    `;

    return;

  }


  container.innerHTML = `
    <div class="empty-state">
      Loading lessons...
    </div>
  `;


  try {

    const {
      data,
      error
    } = await supabaseClient
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
        "Cannot load lessons:",
        error
      );


      container.innerHTML = `
        <div class="empty-state">

          Error loading lessons.

          <br>

          <small>
            ${escapeHtml(
              error.message
            )}
          </small>

        </div>
      `;

      return;

    }


    if (
      !data ||
      data.length === 0
    ) {

      container.innerHTML = `
        <div class="empty-state">

          No lessons yet.

          <br><br>

          Click
          <strong>
            + Add Lesson
          </strong>
          to create the first lesson.

        </div>
      `;

      return;

    }


    renderLessons(
      data
    );

  } catch (error) {

    console.error(
      "Lessons error:",
      error
    );


    container.innerHTML = `
      <div class="empty-state">
        Something went wrong.
      </div>
    `;

  }

}


/* =========================================================
   LESSONS — RENDER
   ========================================================= */

function renderLessons(
  lessons
) {

  const container =
    document.getElementById(
      "lessons-list"
    );


  if (!container) {
    return;
  }


  container.innerHTML = "";


  lessons.forEach(
    (lesson) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "lesson-item";


      item.innerHTML = `

        <div class="lesson-number">

          ${escapeHtml(
            String(
              lesson.sort_order || 0
            )
          )}

        </div>


        <div class="lesson-info">

          <strong>

            ${escapeHtml(
              lesson.title || ""
            )}

          </strong>


          <span>

            ${escapeHtml(
              lesson.description || ""
            )}

          </span>

        </div>


        <div class="lesson-actions">

          <button
            type="button"
            class="lesson-edit"
            onclick="
              SHOHIN_ADMIN.editLesson(
                ${lesson.id}
              )
            "
          >
            Edit
          </button>


          <button
            type="button"
            class="lesson-delete"
            onclick="
              SHOHIN_ADMIN.deleteLesson(
                ${lesson.id}
              )
            "
          >
            Delete
          </button>

        </div>

      `;


      container.appendChild(
        item
      );

    }
  );


  injectLessonStyles();

}


/* =========================================================
   LESSONS — ADD
   ========================================================= */

async function addLesson() {

  if (!supabaseClient) {

    alert(
      "Supabase is not connected."
    );

    return;

  }


  const select =
    document.getElementById(
      "lesson-level-select"
    );


  if (
    !select ||
    !select.value
  ) {

    alert(
      "Please select a level first."
    );

    return;

  }


  const levelId =
    Number(
      select.value
    );


  const title =
    prompt(
      "Lesson title:\nExample: Greetings"
    );


  if (
    !title ||
    !title.trim()
  ) {
    return;
  }


  const description =
    prompt(
      "Lesson description:"
    );


  const sortOrder =
    prompt(
      "Lesson number / sort order:",
      "1"
    );


  try {

    const {
      error
    } = await supabaseClient
      .from("lessons")
      .insert([
        {

          level_id:
            levelId,

          title:
            title.trim(),

          description:
            description
              ? description.trim()
              : "",

          sort_order:
            Number(
              sortOrder
            ) || 0

        }
      ]);


    if (error) {

      console.error(
        "Add lesson error:",
        error
      );


      alert(
        "Error adding lesson:\n" +
        error.message
      );

      return;

    }


    await loadLessons();

    await updateDashboard();


    alert(
      "Lesson added successfully."
    );

  } catch (error) {

    console.error(
      "Add lesson failed:",
      error
    );


    alert(
      "Something went wrong."
    );

  }

}


/* =========================================================
   LESSONS — EDIT
   ========================================================= */

async function editLesson(
  id
) {

  if (!supabaseClient) {
    return;
  }


  try {

    const {
      data,
      error
    } = await supabaseClient
      .from("lessons")
      .select("*")
      .eq(
        "id",
        id
      )
      .single();


    if (error) {

      alert(
        "Cannot load lesson:\n" +
        error.message
      );

      return;

    }


    const newTitle =
      prompt(
        "Lesson title:",
        data.title || ""
      );


    if (
      !newTitle ||
      !newTitle.trim()
    ) {
      return;
    }


    const newDescription =
      prompt(
        "Lesson description:",
        data.description || ""
      );


    const newSortOrder =
      prompt(
        "Lesson number / sort order:",
        data.sort_order || 0
      );


    const {
      error: updateError
    } = await supabaseClient
      .from("lessons")
      .update({

        title:
          newTitle.trim(),

        description:
          newDescription
            ? newDescription.trim()
            : "",

        sort_order:
          Number(
            newSortOrder
          ) || 0

      })
      .eq(
        "id",
        id
      );


    if (updateError) {

      alert(
        "Error updating lesson:\n" +
        updateError.message
      );

      return;

    }


    await loadLessons();

    await updateDashboard();

  } catch (error) {

    console.error(
      "Edit lesson failed:",
      error
    );

  }

}


/* =========================================================
   LESSONS — DELETE
   ========================================================= */

async function deleteLesson(
  id
) {

  if (!supabaseClient) {
    return;
  }


  const confirmed =
    confirm(
      "Delete this lesson?\n\n" +
      "All cards inside this lesson " +
      "may also be deleted."
    );


  if (!confirmed) {
    return;
  }


  try {

    const {
      error
    } = await supabaseClient
      .from("lessons")
      .delete()
      .eq(
        "id",
        id
      );


    if (error) {

      alert(
        "Error deleting lesson:\n" +
        error.message
      );

      return;

    }


    await loadLessons();

    await updateDashboard();

  } catch (error) {

    console.error(
      "Delete lesson failed:",
      error
    );

  }

}


/* =========================================================
   LESSONS — INITIALIZE
   ========================================================= */

async function initializeLessons() {

  await loadLessonLevels();

  await loadLessons();

}


/* =========================================================
   LEVEL STYLES
   ========================================================= */

function injectLevelStyles() {

  if (
    document.getElementById(
      "shohin-level-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "shohin-level-styles";


  style.textContent = `

    .level-item {

      display:flex;

      align-items:center;

      justify-content:space-between;

      gap:20px;

      padding:18px;

      margin-bottom:12px;

      border:
        1px solid
        rgba(255,255,255,0.07);

      border-radius:15px;

      background:
        rgba(255,255,255,0.025);

    }


    .level-main {

      display:flex;

      align-items:center;

      gap:16px;

      min-width:0;

    }


    .level-code {

      width:54px;

      height:54px;

      flex-shrink:0;

      display:flex;

      align-items:center;

      justify-content:center;

      border-radius:14px;

      background:
        linear-gradient(
          135deg,
          #08a56c,
          #087b53
        );

      color:#ffffff;

      font-size:15px;

      font-weight:900;

    }


    .level-info {

      display:flex;

      flex-direction:column;

      gap:4px;

    }


    .level-info strong {

      color:#ffffff;

      font-size:15px;

    }


    .level-info span {

      color:#91aaa0;

      font-size:12px;

    }


    .level-actions {

      display:flex;

      gap:8px;

      flex-shrink:0;

    }


    .level-actions button {

      min-height:36px;

      padding:0 12px;

      border-radius:9px;

      font-size:11px;

      font-weight:800;

      cursor:pointer;

    }


    .level-edit {

      border:
        1px solid
        rgba(8,165,108,0.35);

      background:
        rgba(8,165,108,0.10);

      color:#48d597;

    }


    .level-delete {

      border:
        1px solid
        rgba(255,92,108,0.25);

      background:
        rgba(255,92,108,0.08);

      color:#ff7b88;

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   LESSON STYLES
   ========================================================= */

function injectLessonStyles() {

  if (
    document.getElementById(
      "shohin-lesson-styles"
    )
  ) {
    return;
  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "shohin-lesson-styles";


  style.textContent = `

    .lesson-toolbar {

      display:flex;

      align-items:center;

      gap:14px;

      margin-bottom:20px;

      padding-bottom:18px;

      border-bottom:
        1px solid
        rgba(255,255,255,0.07);

    }


    .field-label {

      color:#91aaa0;

      font-size:12px;

      font-weight:800;

    }


    .admin-select {

      min-width:240px;

      min-height:42px;

      padding:0 12px;

      border:
        1px solid
        rgba(255,255,255,0.10);

      border-radius:10px;

      background:#0d3024;

      color:#ffffff;

      outline:none;

      font-size:13px;

      cursor:pointer;

    }


    .admin-select:focus {

      border-color:#08a56c;

      box-shadow:
        0 0 0 3px
        rgba(8,165,108,0.12);

    }


    .lesson-item {

      display:flex;

      align-items:center;

      gap:16px;

      padding:16px;

      margin-bottom:10px;

      border:
        1px solid
        rgba(255,255,255,0.07);

      border-radius:14px;

      background:
        rgba(255,255,255,0.025);

    }


    .lesson-number {

      width:44px;

      height:44px;

      flex-shrink:0;

      display:flex;

      align-items:center;

      justify-content:center;

      border-radius:12px;

      background:
        linear-gradient(
          135deg,
          #08a56c,
          #087b53
        );

      color:#ffffff;

      font-size:14px;

      font-weight:900;

    }


    .lesson-info {

      flex:1;

      min-width:0;

      display:flex;

      flex-direction:column;

      gap:4px;

    }


    .lesson-info strong {

      color:#ffffff;

      font-size:14px;

    }


    .lesson-info span {

      color:#91aaa0;

      font-size:12px;

      white-space:nowrap;

      overflow:hidden;

      text-overflow:ellipsis;

    }


    .lesson-actions {

      display:flex;

      gap:8px;

      flex-shrink:0;

    }


    .lesson-actions button {

      min-height:34px;

      padding:0 11px;

      border-radius:9px;

      font-size:11px;

      font-weight:800;

      cursor:pointer;

    }


    .lesson-edit {

      border:
        1px solid
        rgba(8,165,108,0.35);

      background:
        rgba(8,165,108,0.10);

      color:#48d597;

    }


    .lesson-delete {

      border:
        1px solid
        rgba(255,92,108,0.25);

      background:
        rgba(255,92,108,0.08);

      color:#ff7b88;

    }


    @media (max-width:600px) {

      .lesson-toolbar {

        align-items:flex-start;

        flex-direction:column;

      }


      .admin-select {

        width:100%;

      }


      .lesson-item {

        align-items:flex-start;

        flex-wrap:wrap;

      }


      .lesson-actions {

        width:100%;

      }


      .lesson-actions button {

        flex:1;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function () {

    const initialized =
      initializeSupabase();


    if (!initialized) {
      return;
    }


    /* Navigation */

    const navItems =
      document.querySelectorAll(
        ".nav-item"
      );


    navItems.forEach(
      (item) => {

        item.addEventListener(
          "click",
          function () {

            const section =
              item.dataset.section;


            openSection(
              section
            );

          }
        );

      }
    );


    /* Saved section */

    const savedSection =
      localStorage.getItem(
        "shohin_admin_last_section"
      ) || "dashboard";


    openSection(
      savedSection
    );


    /* Connection */

    await testSupabaseConnection();


    /* Dashboard */

    await updateDashboard();


    /* Add Level */

    const addLevelButton =
      document.getElementById(
        "add-level-button"
      );


    if (addLevelButton) {

      addLevelButton.addEventListener(
        "click",
        addLevel
      );

    }


    /* Lesson level selector */

    const lessonLevelSelect =
      document.getElementById(
        "lesson-level-select"
      );


    if (lessonLevelSelect) {

      lessonLevelSelect.addEventListener(
        "change",
        loadLessons
      );

    }


    /* Add Lesson */

    const addLessonButton =
      document.getElementById(
        "add-lesson-button"
      );


    if (addLessonButton) {

      addLessonButton.addEventListener(
        "click",
        addLesson
      );

    }

  }
);


/* =========================================================
   GLOBAL ADMIN API
   ========================================================= */

window.SHOHIN_ADMIN = {

  openSection,

  toggleSidebar,

  updateDashboard,

  testSupabaseConnection,

  loadLevels,

  addLevel,

  editLevel,

  deleteLevel,

  loadLessonLevels,

  loadLessons,

  addLesson,

  editLesson,

  deleteLesson,

  initializeLessons,

  getSupabaseClient() {

    return supabaseClient;

  }

};