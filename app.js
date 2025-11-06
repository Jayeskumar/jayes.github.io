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
        title: "Prologue: The Summoning",
        story: `
            <p class="story-intro"><strong>🌙 Prologue: The Summoning</strong></p>
            <p>
                The night sky splits open with crimson lightning. You jolt awake in your small
                chamber at the Academy of Data Arts, your heart pounding. A glowing crystal orb
                hovers before you, pulsing with urgent energy.
            </p>
            <p>
                <em>"Apprentice of the Data Arts,"</em> a voice echoes from the orb, ancient and
                weary. <em>"I am Archmage Valerius. Forgive the intrusion, but desperate times
                demand desperate measures. A corruption spreads through our realm's very foundation—
                the Sacred Databases that hold reality together."</em>
            </p>
            <p>
                The orb's light intensifies, showing visions of kingdoms fading into shadow,
                their records dissolving into chaos. <em>"You possess a rare gift—the ability
                to speak the Ancient Language of SQL. Come to the Grand Library at once. The
                fate of Datarealm hangs by a thread."</em>
            </p>
            <p>
                <strong>Dawn breaks as you arrive at the Grand Library.</strong> Towering obsidian
                pillars reach into the clouds, their surfaces etched with glowing runes. Archmage
                Valerius awaits at the entrance, his silver beard whipping in an unnatural wind.
                His eyes, once bright, are dimmed with exhaustion.
            </p>
            <p>
                <em>"Thank the Ancients you've come,"</em> he says, gripping your shoulder. <em>"Three
                days ago, the Void Corruption began. It's eating away at our kingdom records. If we
                lose that data, the kingdoms themselves will cease to exist. We must verify the
                integrity of what remains."</em>
            </p>
            <p class="quest-prompt">
                <strong>⚡ Your first quest: Retrieve and verify all kingdom records before they're lost forever.</strong>
            </p>
        `,
        task: "Retrieve all information from the Kingdoms table. Use the SELECT statement to view all kingdoms in the database.",
        hint: "Use SELECT * FROM Kingdoms; to see all columns and rows.",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 5 &&
                   result.rowCount === 5;
        },
        successMessage: "✨ The ancient runes flare to life! Valerius's eyes widen in relief. 'By the Ancients... all five kingdoms still exist. You may have just saved countless lives, young mage. But our work has only begun.'"
    },
    {
        title: "Chapter 1: Shadows in the Armory",
        story: `
            <p class="story-intro"><strong>⚔️ Chapter 1: Shadows in the Armory</strong></p>
            <p>
                <strong>As you stabilize the kingdom records, a commotion erupts outside.</strong>
                The heavy doors burst open and Commander Sera Ironheart storms in, her armor
                scorched and dented.
            </p>
            <p>
                <em>"Valerius!"</em> she shouts, barely containing her fury. <em>"The Void creatures
                attacked our supply convoy an hour ago. We lost twelve good soldiers because our
                weapons couldn't pierce their armor. I need to know what high-damage weapons we
                actually have—not what the outdated manifests claim!"</em>
            </p>
            <p>
                The Archmage turns to you urgently. <em>"The Void Corruption has spread to our
                inventory records. Commander Ironheart needs accurate data, NOW. Lives depend on it."</em>
            </p>
            <p>
                Sera's scarred face softens slightly as she looks at you. <em>"You're the one who
                restored the kingdom data? Listen, kid—my soldiers are dying out there with rusted
                blades while our best weapons gather dust because nobody knows where they are. Can
                you find them?"</em>
            </p>
            <p>
                Her hand trembles on her sword hilt—not from fear, but from the weight of command.
                <em>"I need every weapon with more than 15 damage. That's the threshold to hurt
                those Void beasts. Please... I can't lose anyone else."</em>
            </p>
            <p class="quest-prompt">
                <strong>⚡ Find the weapons that can save Commander Ironheart's soldiers.</strong>
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
        successMessage: "⚔️ Sera's eyes light up with hope! 'The Thunder Hammer! The Dragon Sword! I thought we'd lost these!' She clasps your shoulder firmly. 'You just gave my soldiers a fighting chance. I won't forget this, Data-Mage.'"
    },
    {
        title: "Chapter 2: The War Council's Dilemma",
        story: `
            <p class="story-intro"><strong>🐉 Chapter 2: The War Council's Dilemma</strong></p>
            <p>
                <strong>Two days later, a messenger hawk arrives with crimson-sealed orders.</strong>
                You're summoned to the War Council—an honor rarely granted to apprentices. But
                as you enter the obsidian war room, you realize this is no honor.
            </p>
            <p>
                Five rulers surround the strategy table, their faces grim. Queen Seraphina of
                Crystalheim speaks first, her voice cracking. <em>"Yesterday, the Void birthed
                something new. Creatures of nightmare, stronger than anything we've faced. Three
                villages... gone. Not destroyed—erased, as if they never existed."</em>
            </p>
            <p>
                King Thorin slams his fist on the table. <em>"We're fighting blind! Every scout
                we send returns with different reports—if they return at all. We need to know
                which creatures are the true threats!"</em>
            </p>
            <p>
                Commander Ironheart steps forward, her new weapon—one you identified—gleaming at
                her side. <em>"The Data-Mage saved my troops. Let them help us now. We need tactical
                intelligence on the enemy."</em>
            </p>
            <p>
                Archmage Valerius places a heavy tome before you. <em>"The Monster Census—corrupted
                but recoverable. We must identify the apex predators: any creature with 80 or more
                attack power. Only then can we know what we truly face."</em>
            </p>
            <p>
                He leans closer, his voice dropping to a whisper only you can hear. <em>"And we
                must know which is the strongest. Because if we can't stop that one... Datarealm
                falls."</em>
            </p>
            <p class="quest-prompt">
                <strong>⚡ Identify and rank the deadliest threats to the realm.</strong>
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
        successMessage: "🎯 The council falls silent as your results appear. Queen Seraphina's face goes pale. 'The Void Walker... 100 attack power. It's real.' King Thorin nods gravely. 'Now we know our enemy. Data-Mage, you've given us the truth—however dark it may be.'"
    },
    {
        title: "Chapter 3: The Broken Alliance",
        story: `
            <p class="story-intro"><strong>🤝 Chapter 3: The Broken Alliance</strong></p>
            <p>
                <strong>The War Council erupts into chaos.</strong> King Thorin points an accusing
                finger at Dark Lord Malakai of Shadowmere. <em>"Your kingdom harbors the Void Walker!
                I say Shadowmere has betrayed us all!"</em>
            </p>
            <p>
                Malakai rises, darkness swirling around him. <em>"Careful, dwarf. My people suffer
                as much as yours. The Void Walker attacked Shadowmere FIRST. We've been fighting
                alone while you debated in comfort!"</em>
            </p>
            <p>
                Queen Seraphina steps between them. <em>"Enough! We tear ourselves apart while the
                Void grows stronger. We need unity, not accusations."</em> She turns to you with
                desperate eyes. <em>"Data-Mage, show them. Show them what each kingdom brings to
                this fight."</em>
            </p>
            <p>
                Elder Druid Elara of Mystic Vale appears in a shimmer of green light, her ancient
                voice cutting through the tension. <em>"The young mage must perform the Weaving—the
                joining of separate truths into one tapestry. Only then will you see that you need
                each other."</em>
            </p>
            <p>
                Commander Ironheart slams her weapon on the table. <em>"My scouts report that the
                Void creatures are organizing. They'll strike as one force. We must do the same,
                or die divided."</em>
            </p>
            <p>
                Archmage Valerius places his staff before you, its crystal pulsing with urgency.
                <em>"This is the most complex spell you've attempted. You must unite the knowledge
                of kingdoms with their weaponry. Show them their combined strength. The alliance—
                and perhaps our world—depends on what you discover."</em>
            </p>
            <p class="quest-prompt">
                <strong>⚡ Weave together the kingdoms and their weapons to reveal the truth.</strong>
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
        successMessage: "✨ The data streams into light, forming a map of military strength across all kingdoms! King Thorin's eyes widen. 'By my beard... even Shadowmere's Dragon Sword. We're all armed, we're all fighting.' Malakai nods slowly. 'Perhaps... we've been allies all along.' The Alliance is born."
    },
    {
        title: "Chapter 4: The Final Convergence",
        story: `
            <p class="story-intro"><strong>⚡ Chapter 4: The Final Convergence</strong></p>
            <p>
                <strong>The ground trembles. Reality itself begins to fracture.</strong> Through the
                tower windows, you see it—a massive tear in the sky, pouring Void energy into
                Datarealm. The final assault has begun.
            </p>
            <p>
                Archmage Valerius staggers, blood trickling from his nose. <em>"The Void Walker...
                it's not just a creature. It's the Corruption given form. To seal it, we need a
                ritual of unprecedented power—the combined magical energy of all five kingdoms."</em>
            </p>
            <p>
                <em>"But here's the terrible truth,"</em> he continues, gripping your arm with surprising
                strength. <em>"The ritual requires knowing the EXACT magical reserves. Too little,
                and the spell fails. Too much, and the backlash will destroy us. We get ONE chance."</em>
            </p>
            <p>
                Commander Ironheart bursts through the door, armor cracked, blade broken. <em>"They're
                here. The Void army breaches our walls. Whatever you're going to do, Data-Mage—do
                it NOW!"</em>
            </p>
            <p>
                The five rulers appear as magical projections, each bleeding, exhausted, but determined.
                Queen Seraphina speaks for them all. <em>"Our people are ready to channel everything.
                Every artifact, every enchanted item, every drop of magic we possess. Tell us if it's
                enough."</em>
            </p>
            <p>
                The tower shakes violently. Through the chaos, Elder Elara's voice rings clear in your
                mind. <em>"This is why you were chosen. Not for your power, but for your precision. The
                Mathematics of Reality itself flows through the ancient SQL. Calculate the total magic
                of each kingdom. Let the numbers guide us to salvation—or oblivion."</em>
            </p>
            <p>
                Valerius places both hands on your shoulders, his eyes blazing with desperate hope.
                <em>"Master Data-Mage—for that is what you've become—aggregate our power. Show us if
                we can save our world."</em>
            </p>
            <p class="quest-prompt">
                <strong>⚡ THE FINAL CALCULATION: Aggregate all magical power by kingdom!</strong>
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
        successMessage: "🌟 THE NUMBERS MANIFEST AS PURE LIGHT! Valerius's voice booms: 'IT'S ENOUGH! CHANNEL IT ALL!' The five kingdoms unleash their combined magic through your calculations. The Void Walker SCREAMS as reality reasserts itself. The tear in the sky seals. Silence. Then, cheers echo across all five kingdoms. You've saved Datarealm."
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
                <h1>✨ EPILOGUE: THE NEW ERA ✨</h1>

                <div class="epilogue-text">
                    <p class="epilogue-intro">
                        <strong>Three months after the Battle of the Void...</strong>
                    </p>

                    <p>
                        The Grand Library has been rebuilt, its halls now filled with students eager to
                        learn the SQL arts. You stand at the window of your new office—the Master Data-Mage's
                        Tower—watching the five kingdoms thrive in their newfound unity.
                    </p>

                    <p>
                        <em>Commander Sera Ironheart</em> now leads the Alliance's military, her strategic
                        brilliance enhanced by data-driven intelligence. She waves to you from the training
                        grounds below, her students practicing both combat and query optimization.
                    </p>

                    <p>
                        <em>Queen Seraphina and King Thorin</em> have established the first cross-kingdom
                        trade network, their economies flourishing through shared resources. Dark Lord Malakai,
                        no longer shadowed by suspicion, has opened Shadowmere's ancient archives to all scholars.
                    </p>

                    <p>
                        <em>Elder Druid Elara</em> visits weekly, teaching you deeper mysteries of data magic
                        that even Valerius never mastered. Speaking of whom...
                    </p>

                    <p>
                        Archmage Valerius approaches, his eyes bright with pride and something else—hope.
                        <em>"Ready for your official coronation as my successor?"</em> he asks with a smile.
                        <em>"The realms need young blood. Besides, I've been offered a teaching position in
                        the new SQL Academy. Turns out I'm not half bad at explaining JOINs to beginners."</em>
                    </p>

                    <p>
                        He places his ancient staff in your hands. <em>"You've mastered the foundations, but
                        remember—every master was once an apprentice. Keep learning, keep growing. The databases
                        of reality hold infinite secrets."</em>
                    </p>

                    <p class="epilogue-achievement">
                        <strong>🎓 SKILLS MASTERED:</strong>
                        <br>✓ SELECT statements - Retrieving data from reality itself
                        <br>✓ WHERE clauses - Filtering truth from chaos
                        <br>✓ ORDER BY - Bringing order to disorder
                        <br>✓ JOIN operations - Uniting separate truths
                        <br>✓ Aggregate functions - Calculating the sum of all things
                    </p>

                    <p class="epilogue-final">
                        <strong>You are no longer an apprentice.</strong><br>
                        You are a <span style="color: gold; font-size: 1.2em;">✨ Master Data-Mage ✨</span><br>
                        <em>Protector of Datarealm and Guardian of the Sacred Databases.</em>
                    </p>

                    <p style="margin-top: 2rem; font-style: italic; opacity: 0.8;">
                        As you gaze across the kingdoms, you know this victory is just the beginning.
                        Somewhere in the infinite data cosmos, new challenges await. But you're ready.
                        You'll always be ready.
                    </p>
                </div>

                <button class="btn-restart" onclick="location.reload()">
                    🔄 Begin a New Journey
                </button>

                <p style="margin-top: 1rem; font-size: 0.9em; opacity: 0.7;">
                    Thank you for playing! Continue your SQL journey in the real world.
                </p>
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
