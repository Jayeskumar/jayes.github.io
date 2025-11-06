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
    },
    // ============================================
    // DORAEMON EPISODE - Gadgets Database
    // ============================================
    {
        title: "Doraemon Episode 1: Welcome to the 22nd Century",
        story: `
            <p class="story-intro"><strong>Doraemon Episode 1: Welcome to the 22nd Century</strong></p>
            <p>
                "Nobita! Wake up!" Doraemon's voice echoes through your room. You rub your eyes and see
                the blue robotic cat standing in front of a glowing database terminal.
            </p>
            <p>
                "What's this, Doraemon?" you ask curiously.
            </p>
            <p>
                "This is the Future Gadgets Database! It contains all the amazing gadgets from the 22nd century.
                But there's a problem - the data is scattered everywhere! I need your help to organize it using SQL."
            </p>
            <p class="quest-prompt">
                <strong>🔧 Your first task: Explore all the gadgets in the database!</strong>
            </p>
        `,
        task: "Retrieve all gadgets from the Gadgets table. Use SELECT to see all the amazing inventions.",
        hint: "Use SELECT * FROM Gadgets; to see all gadget information.",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 7 &&
                   result.rowCount === 12;
        },
        successMessage: "Wonderful! You've discovered all 12 amazing gadgets from Doraemon's pocket! The Anywhere Door, Take-copter, Time Machine and more await your adventures!"
    },
    {
        title: "Doraemon Episode 2: Finding the Most Powerful Gadgets",
        story: `
            <p class="story-intro"><strong>Doraemon Episode 2: Finding the Most Powerful Gadgets</strong></p>
            <p>
                Gian and Suneo are bullying the neighborhood kids again! "Doraemon, we need to show them
                something impressive!" you plead.
            </p>
            <p>
                Doraemon opens his magical pocket and says, "Let's find the most powerful gadgets we have.
                But first, you need to query the database to find gadgets with high power levels!"
            </p>
            <p class="quest-prompt">
                <strong>🔧 Find all gadgets with power level greater than 85!</strong>
            </p>
        `,
        task: "Query the Gadgets table to find all gadgets where power_level is greater than 85. Order them by power_level descending.",
        hint: "Use WHERE power_level > 85 and ORDER BY power_level DESC",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 5 &&
                   result.values.every(row => {
                       const powerIndex = result.columns.indexOf('power_level');
                       return row[powerIndex] > 85;
                   }) &&
                   // Check if sorted descending
                   (() => {
                       const powerIndex = result.columns.indexOf('power_level');
                       for (let i = 0; i < result.values.length - 1; i++) {
                           if (result.values[i][powerIndex] < result.values[i + 1][powerIndex]) {
                               return false;
                           }
                       }
                       return true;
                   })();
        },
        successMessage: "Amazing! You found the Time Machine (100), Anywhere Door (95), Time Cloth (92), What-If Phone Booth (90), and Spare Pocket (88)! Gian and Suneo are speechless!"
    },
    {
        title: "Doraemon Episode 3: Categorizing Gadgets",
        story: `
            <p class="story-intro"><strong>Doraemon Episode 3: Categorizing Gadgets</strong></p>
            <p>
                Shizuka visits your home for a study session. "Nobita, can you help me understand
                how these gadgets are organized?" she asks sweetly.
            </p>
            <p>
                Doraemon suggests, "Why don't you show Shizuka how many gadgets we have in each category?
                Use your SQL skills to group and count them!"
            </p>
            <p class="quest-prompt">
                <strong>🔧 Count how many gadgets are in each category!</strong>
            </p>
        `,
        task: "Count the number of gadgets in each category. Show the category and the count, grouped by category. Order by count descending.",
        hint: "Use GROUP BY and COUNT: SELECT category, COUNT(*) as gadget_count FROM Gadgets GROUP BY category ORDER BY gadget_count DESC",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 3 &&
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
        successMessage: "Perfect! You showed Shizuka that we have 3 Size Manipulation gadgets, 2 Transportation gadgets, and more! She's so impressed with your SQL skills!"
    },
    {
        title: "Doraemon Episode 4: Tracking Gadget Adventures",
        story: `
            <p class="story-intro"><strong>Doraemon Episode 4: Tracking Gadget Adventures</strong></p>
            <p>
                "Nobita, we need to prepare a report for the Future Department!" Doraemon says urgently.
                "They want to know which gadgets have been used most successfully in adventures."
            </p>
            <p>
                "We need to combine the Gadgets table with the GadgetUsage table to see which
                gadgets have the best success rates!"
            </p>
            <p class="quest-prompt">
                <strong>🔧 Join the tables to find gadget usage statistics!</strong>
            </p>
        `,
        task: "Join the Gadgets and GadgetUsage tables to show gadget names and their success rates. Show only gadgets with success_rate >= 90. Include gadget_name, user_name, and success_rate columns.",
        hint: "Use JOIN: SELECT g.gadget_name, gu.user_name, gu.success_rate FROM GadgetUsage gu JOIN Gadgets g ON gu.gadget_id = g.gadget_id WHERE gu.success_rate >= 90",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 3 &&
                   result.rowCount >= 4 &&
                   result.columns.includes('gadget_name') &&
                   result.columns.includes('success_rate') &&
                   result.values.every(row => {
                       const successIndex = result.columns.indexOf('success_rate');
                       return row[successIndex] >= 90;
                   });
        },
        successMessage: "Excellent work! The Future Department is very pleased! The Anywhere Door, Time Machine, Translation Jelly, and What-If Phone Booth all have success rates of 90% or higher!"
    },
    // ============================================
    // TAMIL MOVIE EPISODE - Hospital Database Mystery
    // ============================================
    {
        title: "Mystery Episode 1: The Suspicious Father",
        story: `
            <p class="story-intro"><strong>Aganum Innoruthan Maganum - Episode 1: The Suspicious Father</strong></p>
            <p>
                The hospital corridors are quiet as Kural's father, a retired detective, sits in his office
                staring at medical reports with deep concern. His daughter Kural and son-in-law Agan both
                have O+ blood group, but their newborn son Madasamy has AB+ blood group.
            </p>
            <p>
                "This is impossible according to basic genetics," he mutters. "Two O+ parents cannot
                have an AB+ child. Something is wrong here."
            </p>
            <p>
                He opens the hospital database terminal with determination in his eyes.
            </p>
            <p class="quest-prompt">
                <strong>🔍 First, let's verify the blood groups of the family members in our database.</strong>
            </p>
        `,
        task: "Query the Patients table to find the blood groups of Agan, Kural, and Madasamy. Select patient_name and blood_group columns only.",
        hint: "Use WHERE with IN or OR: SELECT patient_name, blood_group FROM Patients WHERE patient_name IN ('Agan', 'Kural', 'Madasamy')",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 2 &&
                   result.rowCount === 3 &&
                   result.columns.includes('patient_name') &&
                   result.columns.includes('blood_group');
        },
        successMessage: "The records confirm it: Agan (O+), Kural (O+), and Madasamy (AB+). The father's suspicions are correct - something doesn't add up genetically!"
    },
    {
        title: "Mystery Episode 2: Investigating Medical Records",
        story: `
            <p class="story-intro"><strong>Aganum Innoruthan Maganum - Episode 2: Investigating Medical Records</strong></p>
            <p>
                Kural's father leans back in his chair, deep in thought. "I need to check Kural's
                medical history, especially around the time of delivery. Maybe there's a clue here."
            </p>
            <p>
                He starts searching through the medical records database, looking for any information
                about Kural's pregnancy and delivery.
            </p>
            <p class="quest-prompt">
                <strong>🔍 Find all medical records related to Kural!</strong>
            </p>
        `,
        task: "Join the Patients and MedicalRecords tables to find all medical records for Kural. Show patient_name, diagnosis, treatment, doctor_name, and record_date.",
        hint: "Use JOIN: SELECT p.patient_name, mr.diagnosis, mr.treatment, mr.doctor_name, mr.record_date FROM MedicalRecords mr JOIN Patients p ON mr.patient_id = p.patient_id WHERE p.patient_name = 'Kural'",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 5 &&
                   result.rowCount >= 2 &&
                   result.columns.includes('patient_name') &&
                   result.columns.includes('diagnosis') &&
                   result.values.every(row => {
                       const nameIndex = result.columns.indexOf('patient_name');
                       return row[nameIndex] === 'Kural';
                   });
        },
        successMessage: "Interesting! You found records of Kural's prenatal care and delivery. Dr. Lakshmi handled both. But this doesn't explain the blood group mystery yet..."
    },
    {
        title: "Mystery Episode 3: The Blood Donation Trail",
        story: `
            <p class="story-intro"><strong>Aganum Innoruthan Maganum - Episode 3: The Blood Donation Trail</strong></p>
            <p>
                "Wait a minute..." Kural's father suddenly sits up straight. "What if Kural needed
                a blood transfusion during delivery? Let me check the blood donation records!"
            </p>
            <p>
                He opens the blood donations database, his hands trembling slightly. "If there was
                a complication during delivery, there should be a record of blood donation..."
            </p>
            <p class="quest-prompt">
                <strong>🔍 Find all blood donations where the recipient was Kural!</strong>
            </p>
        `,
        task: "Query the BloodDonations table to find donations where recipient_name is 'Kural'. Show donor_name, donor_blood_group, and donation_date.",
        hint: "Use WHERE: SELECT donor_name, donor_blood_group, donation_date FROM BloodDonations WHERE recipient_name = 'Kural'",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 3 &&
                   result.rowCount >= 1 &&
                   result.values.some(row => {
                       const donorIndex = result.columns.indexOf('donor_name');
                       const bloodGroupIndex = result.columns.indexOf('donor_blood_group');
                       return row[donorIndex] === 'Kumaran' && row[bloodGroupIndex] === 'AB+';
                   });
        },
        successMessage: "Aha! A breakthrough! Kumaran donated AB+ blood to Kural on December 20, 2023 - just before the delivery! But this still doesn't explain the baby's blood group..."
    },
    {
        title: "Mystery Episode 4: The Shocking Truth",
        story: `
            <p class="story-intro"><strong>Aganum Innoruthan Maganum - Episode 4: The Shocking Truth</strong></p>
            <p>
                Kural's father's eyes widen as the pieces start falling into place. "Wait... if the
                baby has AB+ blood group, and both supposed parents have O+ blood group, then..."
            </p>
            <p>
                "I need to check who else has AB+ blood group in this hospital. The biological father
                must have either A, B, or AB blood group for this to be possible!"
            </p>
            <p class="quest-prompt">
                <strong>🔍 Find all patients with AB+ blood group to identify potential biological fathers!</strong>
            </p>
        `,
        task: "Query the Patients table to find all patients with blood_group = 'AB+'. Show patient_name, blood_group, and date_of_birth. Order by admission_date.",
        hint: "Use WHERE: SELECT patient_name, blood_group, date_of_birth FROM Patients WHERE blood_group = 'AB+' ORDER BY admission_date",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 2 &&
                   result.values.some(row => {
                       const nameIndex = result.columns.indexOf('patient_name');
                       return row[nameIndex] === 'Kumaran' || row[nameIndex] === 'Madasamy';
                   });
        },
        successMessage: "The database reveals: Kumaran has AB+ blood group! He donated blood to Kural just before delivery. Could there be a connection beyond just blood donation?"
    },
    {
        title: "Mystery Episode 5: Uncovering the Family Secret",
        story: `
            <p class="story-intro"><strong>Aganum Innoruthan Maganum - Episode 5: The Final Investigation</strong></p>
            <p>
                The father takes a deep breath. "This is delicate, but I must know the complete truth.
                Let me check the family relations database to see if there are any hidden connections."
            </p>
            <p>
                "If my suspicions are correct, this will reveal a truth that could shatter or explain everything."
            </p>
            <p class="quest-prompt">
                <strong>🔍 Find all people with AB+ blood group in the FamilyRelations table and their children!</strong>
            </p>
        `,
        task: "Query the FamilyRelations table to find all people with blood_group = 'AB+'. Show person_name, blood_group, parent1_name, parent2_name, and child_name.",
        hint: "Use WHERE: SELECT person_name, blood_group, parent1_name, parent2_name, child_name FROM FamilyRelations WHERE blood_group = 'AB+'",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 2 &&
                   result.columns.length === 5;
        },
        successMessage: "REVELATION! The database shows both Kumaran and Madasamy have AB+ blood. The genetic evidence, the blood donation timing, and the hospital records all point to a complex truth that the family must now face..."
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
