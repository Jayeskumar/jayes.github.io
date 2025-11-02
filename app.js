// ============================================
// SNU SQL-Quest: Main Game Logic
// ============================================

// Game State
let currentChapter = 0;
let isMusicPlaying = true;
let schemaVisible = true;

// DOM Elements
let storyText, taskDescription, hintText, chapterIndicator;
let sqlInput, resultsContent, feedbackPanel, feedbackContent;
let executeBtn, clearBtn, nextBtn, restartBtn, toggleSchemaBtn, toggleMusicBtn;
let schemaContent;
let ambientAudio, successAudio, errorAudio, pageTurnAudio;

// Game Chapters and Tasks
const chapters = [
    {
        title: "Chapter 1: The Elder's Library",
        story: `
            <p class="story-intro"><strong>Chapter 1: The Elder's Library</strong></p>
            <p>
                You stand before the Grand Library of Eldoria, its ancient shelves stretching
                into the mystical darkness above. The Head Mage, Archmage Valerius, approaches
                you with concern etched across his weathered face.
            </p>
            <p>
                "Apprentice," he speaks gravely, "the kingdom records have been scattered by
                a dark spell. I need you to retrieve information about our realm."
            </p>
            <p class="quest-prompt">
                <strong>⚡ Your first task is to understand the kingdoms in our database.</strong>
            </p>
        `,
        task: "Retrieve all information from the Kingdoms table. Use the SELECT statement to view all kingdoms in the database.",
        hint: "Use SELECT * FROM Kingdoms; to see all columns and rows.",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 5 &&
                   result.rowCount === 5;
        },
        successMessage: "Excellent! The mists clear, revealing all five kingdoms of the realm. The Archmage nods with approval."
    },
    {
        title: "Chapter 2: The Warrior's Challenge",
        story: `
            <p class="story-intro"><strong>Chapter 2: The Warrior's Challenge</strong></p>
            <p>
                Word of your success has reached the Training Grounds of Eldoria. The Master-at-Arms,
                a scarred veteran of countless battles, stops you at the armory entrance.
            </p>
            <p>
                "So, you're the Data-Mage apprentice everyone's talking about," he says with
                a skeptical grin. "If you want to help us prepare for battle, prove your worth.
                Find me all the weapons with significant offensive power."
            </p>
            <p class="quest-prompt">
                <strong>⚡ Find all weapons with damage greater than 15.</strong>
            </p>
        `,
        task: "Query the Inventory table to find all items where the item_type is 'Weapon' AND the damage is greater than 15.",
        hint: "Use SELECT with WHERE clause: WHERE item_type = 'Weapon' AND damage > 15",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount === 4 &&
                   result.values.every(row => {
                       const damageIndex = result.columns.indexOf('damage');
                       const typeIndex = result.columns.indexOf('item_type');
                       return row[damageIndex] > 15 && row[typeIndex] === 'Weapon';
                   });
        },
        successMessage: "Brilliant! You've identified the Thunder Hammer, Dragon Sword, Fire Bow, and Crystal Staff. The warriors arm themselves with renewed confidence."
    },
    {
        title: "Chapter 3: The Monster Threat",
        story: `
            <p class="story-intro"><strong>Chapter 3: The Monster Threat</strong></p>
            <p>
                Dark clouds gather over the kingdom. Reports flood in of powerful creatures
                terrorizing the countryside. The Council of War convenes in emergency session.
            </p>
            <p>
                Queen Seraphina of Crystalheim sends an urgent message: "We must identify
                the most dangerous threats. Find the monsters with the highest attack power
                so we can deploy our forces accordingly."
            </p>
            <p class="quest-prompt">
                <strong>⚡ Identify the deadliest monsters in the realm.</strong>
            </p>
        `,
        task: "Find all monsters with attack_power greater than or equal to 80. Sort them by attack_power in descending order.",
        hint: "Use WHERE attack_power >= 80 and ORDER BY attack_power DESC",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount === 5 &&
                   result.values.every(row => {
                       const attackIndex = result.columns.indexOf('attack_power');
                       return row[attackIndex] >= 80;
                   }) &&
                   // Check if sorted descending
                   (() => {
                       const attackIndex = result.columns.indexOf('attack_power');
                       for (let i = 0; i < result.values.length - 1; i++) {
                           if (result.values[i][attackIndex] < result.values[i + 1][attackIndex]) {
                               return false;
                           }
                       }
                       return true;
                   })();
        },
        successMessage: "Outstanding! The Void Walker, Dark Sorcerer, Phoenix, Fire Drake, and Ice Wyrm are identified as priority threats. The kingdoms mobilize their defenses."
    },
    {
        title: "Chapter 4: The Alliance of Kingdoms",
        story: `
            <p class="story-intro"><strong>Chapter 4: The Alliance of Kingdoms</strong></p>
            <p>
                To face the growing darkness, the kingdoms must unite. King Thorin of Ironforge
                proposes a grand alliance, but first, you must understand which kingdoms possess
                which weapons.
            </p>
            <p>
                Elder Druid Elara of Mystic Vale appears in a vision: "Young mage, you must
                master the art of joining knowledge. Connect the kingdoms with their armaments."
            </p>
            <p class="quest-prompt">
                <strong>⚡ Unite the knowledge of kingdoms and their weapons.</strong>
            </p>
        `,
        task: "Join the Kingdoms and Inventory tables to show all weapons along with their kingdom names. Include kingdom_name, item_name, and damage columns only.",
        hint: "Use JOIN: SELECT k.kingdom_name, i.item_name, i.damage FROM Inventory i JOIN Kingdoms k ON i.kingdom_id = k.kingdom_id WHERE i.item_type = 'Weapon'",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 3 &&
                   result.rowCount >= 6 &&
                   result.columns.includes('kingdom_name') &&
                   result.columns.includes('item_name') &&
                   result.columns.includes('damage');
        },
        successMessage: "Masterful! You've woven together the threads of kingdoms and armaments. The Alliance Council now understands each realm's military strength."
    },
    {
        title: "Chapter 5: The Final Ritual",
        story: `
            <p class="story-intro"><strong>Chapter 5: The Final Ritual</strong></p>
            <p>
                The final battle approaches. Archmage Valerius calls you to the highest tower
                of Eldoria. Ancient crystals pulse with arcane energy around you.
            </p>
            <p>
                "You have proven yourself, young mage. Now for the ultimate test: we must
                calculate the total magical power available to each kingdom. This knowledge
                will determine the fate of our world."
            </p>
            <p class="quest-prompt">
                <strong>⚡ Harness the power of aggregation magic!</strong>
            </p>
        `,
        task: "Calculate the total magic_power available from items for each kingdom. Show kingdom_name and the SUM of magic_power, grouped by kingdom. Order by total power descending.",
        hint: "Use GROUP BY and SUM: SELECT k.kingdom_name, SUM(i.magic_power) as total_power FROM Inventory i JOIN Kingdoms k ON i.kingdom_id = k.kingdom_id GROUP BY k.kingdom_name ORDER BY total_power DESC",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 4 &&
                   result.columns.length === 2 &&
                   // Check if sorted descending
                   (() => {
                       for (let i = 0; i < result.values.length - 1; i++) {
                           if (result.values[i][1] < result.values[i + 1][1]) {
                               return false;
                           }
                       }
                       return true;
                   })();
        },
        successMessage: "MAGNIFICENT! The crystals blaze with light! You have mastered the ancient art of SQL aggregation. The kingdoms' combined power flows through you!"
    }
];

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing SNU SQL-Quest...');

    // Initialize DOM elements
    initializeElements();

    // Initialize event listeners
    initializeEventListeners();

    // Initialize the database
    const dbInitialized = await initDatabase();

    if (dbInitialized) {
        // Load the first chapter
        loadChapter(0);

        // Start background music
        playAmbientMusic();

        console.log('Game initialized successfully!');
    }
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
    // Story and task elements
    storyText = document.getElementById('story-text');
    taskDescription = document.getElementById('task-description');
    hintText = document.getElementById('hint-text');
    chapterIndicator = document.getElementById('chapter-indicator');

    // Input and output elements
    sqlInput = document.getElementById('sql-input');
    resultsContent = document.getElementById('results-content');
    feedbackPanel = document.getElementById('feedback-panel');
    feedbackContent = document.getElementById('feedback-content');

    // Buttons
    executeBtn = document.getElementById('execute-btn');
    clearBtn = document.getElementById('clear-btn');
    nextBtn = document.getElementById('next-btn');
    restartBtn = document.getElementById('restart-btn');
    toggleSchemaBtn = document.getElementById('toggle-schema');
    toggleMusicBtn = document.getElementById('toggle-music');

    // Schema
    schemaContent = document.getElementById('schema-content');

    // Audio elements
    ambientAudio = document.getElementById('ambient-audio');
    successAudio = document.getElementById('success-audio');
    errorAudio = document.getElementById('error-audio');
    pageTurnAudio = document.getElementById('page-turn-audio');

    // Set audio volumes
    if (ambientAudio) ambientAudio.volume = 0.3;
    if (successAudio) successAudio.volume = 0.5;
    if (errorAudio) errorAudio.volume = 0.4;
    if (pageTurnAudio) pageTurnAudio.volume = 0.5;
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Execute button
    executeBtn.addEventListener('click', executeUserQuery);

    // Clear button
    clearBtn.addEventListener('click', () => {
        sqlInput.value = '';
        sqlInput.focus();
    });

    // Next button
    nextBtn.addEventListener('click', () => {
        playPageTurn();
        loadChapter(currentChapter + 1);
    });

    // Restart button
    restartBtn.addEventListener('click', () => {
        playPageTurn();
        loadChapter(0);
    });

    // Toggle schema
    toggleSchemaBtn.addEventListener('click', () => {
        schemaVisible = !schemaVisible;
        schemaContent.style.display = schemaVisible ? 'grid' : 'none';
    });

    // Toggle music
    toggleMusicBtn.addEventListener('click', toggleMusic);

    // Enter key in textarea (Shift+Enter for newline, Enter for execute)
    sqlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            executeUserQuery();
        }
    });
}

/**
 * Load a specific chapter
 */
function loadChapter(chapterIndex) {
    if (chapterIndex >= chapters.length) {
        showVictoryScreen();
        return;
    }

    currentChapter = chapterIndex;
    const chapter = chapters[chapterIndex];

    // Update chapter indicator
    chapterIndicator.textContent = `Chapter ${chapterIndex + 1} of ${chapters.length}`;

    // Update story
    storyText.innerHTML = chapter.story;

    // Update task
    taskDescription.textContent = chapter.task;

    // Update hint
    hintText.textContent = chapter.hint;

    // Clear previous results
    resultsContent.innerHTML = '<p class="results-placeholder">Your query results will appear here...</p>';

    // Clear SQL input
    sqlInput.value = '';

    // Hide feedback panel
    feedbackPanel.style.display = 'none';

    // Hide next button
    nextBtn.style.display = 'none';

    // Show restart button if not on first chapter
    restartBtn.style.display = chapterIndex > 0 ? 'block' : 'none';

    // Focus on SQL input
    sqlInput.focus();
}

/**
 * Execute the user's SQL query
 */
function executeUserQuery() {
    const query = sqlInput.value;

    // Execute the query
    const result = executeQuery(query);

    // Display results
    displayResults(result);

    // Verify if the query is correct for this chapter
    if (result.success) {
        const chapter = chapters[currentChapter];
        const isCorrect = chapter.verifyFunction(result);

        if (isCorrect) {
            showSuccess(chapter.successMessage);
        } else {
            showError("The spell produces results, but they don't match what we need. Check the quest requirements carefully.");
        }
    } else {
        showError(result.error);
    }
}

/**
 * Display query results
 */
function displayResults(result) {
    if (!result.success) {
        resultsContent.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> ${result.error}
            </div>
        `;
        return;
    }

    if (result.rowCount === 0) {
        resultsContent.innerHTML = '<p class="results-placeholder">Query executed successfully, but returned no results.</p>';
        return;
    }

    // Create table
    let html = '<table class="results-table"><thead><tr>';

    // Add column headers
    result.columns.forEach(col => {
        html += `<th>${col}</th>`;
    });

    html += '</tr></thead><tbody>';

    // Add rows
    result.values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${cell !== null ? cell : 'NULL'}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';

    resultsContent.innerHTML = html;
}

/**
 * Show success feedback
 */
function showSuccess(message) {
    feedbackPanel.style.display = 'block';
    feedbackContent.innerHTML = `
        <p class="feedback-success">
            ✅ ${message}
        </p>
    `;

    // Play success sound
    playSuccess();

    // Show next button
    if (currentChapter < chapters.length - 1) {
        nextBtn.style.display = 'block';
    } else {
        // Last chapter completed
        setTimeout(() => {
            showVictoryScreen();
        }, 2000);
    }
}

/**
 * Show error feedback
 */
function showError(message) {
    feedbackPanel.style.display = 'block';
    feedbackContent.innerHTML = `
        <p class="feedback-error">
            ❌ ${message}
        </p>
    `;

    // Play error sound
    playError();
}

/**
 * Show victory screen
 */
function showVictoryScreen() {
    const victoryHTML = `
        <div class="victory-screen">
            <div class="victory-content">
                <h1>🎉 QUEST COMPLETE! 🎉</h1>
                <p>
                    Congratulations, <strong>Master Data-Mage</strong>!
                </p>
                <p>
                    You have conquered all five challenges and mastered the ancient
                    art of SQL. The kingdoms of Datarealm are forever in your debt.
                </p>
                <p>
                    You have learned:
                    <br>• SELECT statements
                    <br>• WHERE clauses
                    <br>• ORDER BY sorting
                    <br>• JOIN operations
                    <br>• Aggregate functions (SUM, GROUP BY)
                </p>
                <p style="margin-top: 2rem;">
                    <strong>Your journey as a Data-Mage has only just begun...</strong>
                </p>
                <button class="btn-restart" onclick="location.reload()">
                    🔄 Begin New Quest
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', victoryHTML);
    playSuccess();
}

/**
 * Play ambient background music
 */
function playAmbientMusic() {
    if (ambientAudio && isMusicPlaying) {
        ambientAudio.play().catch(e => {
            console.log('Autoplay prevented. User interaction needed.');
        });
    }
}

/**
 * Toggle background music
 */
function toggleMusic() {
    isMusicPlaying = !isMusicPlaying;

    if (isMusicPlaying) {
        ambientAudio.play();
        toggleMusicBtn.textContent = '🔊 Music: ON';
    } else {
        ambientAudio.pause();
        toggleMusicBtn.textContent = '🔇 Music: OFF';
    }
}

/**
 * Play success sound
 */
function playSuccess() {
    if (successAudio) {
        successAudio.currentTime = 0;
        successAudio.play().catch(e => console.log('Audio play failed:', e));
    }
}

/**
 * Play error sound
 */
function playError() {
    if (errorAudio) {
        errorAudio.currentTime = 0;
        errorAudio.play().catch(e => console.log('Audio play failed:', e));
    }
}

/**
 * Play page turn sound
 */
function playPageTurn() {
    if (pageTurnAudio) {
        pageTurnAudio.currentTime = 0;
        pageTurnAudio.play().catch(e => console.log('Audio play failed:', e));
    }
}
