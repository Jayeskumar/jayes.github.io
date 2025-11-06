// ============================================
// SNU SQL-Quest: Main Game Logic
// ============================================

// Game State
let currentChapter = 0;
let isMusicPlaying = true;
let schemaVisible = true;
let selectedGame = null; // Track which game is selected
let gameChapters = []; // Chapters for the current game

// DOM Elements
let storyText, taskDescription, hintText, chapterIndicator;
let sqlInput, resultsContent, feedbackPanel, feedbackContent;
let executeBtn, clearBtn, nextBtn, restartBtn, toggleSchemaBtn, toggleMusicBtn;
let schemaContent;
let ambientAudio, successAudio, errorAudio, pageTurnAudio;
let gameSelection, gameContent, backToSelectionBtn;
let conceptBox, conceptTitle, conceptDescription, conceptExample;

// Game Definitions
const games = {
    fantasy: {
        name: "Data Mage's Journey",
        icon: "⚔️",
        startChapter: 0,
        endChapter: 4
    },
    doraemon: {
        name: "Doraemon's Gadget Database",
        icon: "🔧",
        startChapter: 5,
        endChapter: 8
    },
    mystery: {
        name: "Hospital Mystery Detective",
        icon: "🔍",
        startChapter: 9,
        endChapter: 13
    }
};

// Game Chapters and Tasks
const allChapters = [
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
        title: "Mystery Episode 1: The Genetic Puzzle",
        concept: {
            title: "SELECT with WHERE and IN Clause",
            description: "The SELECT statement retrieves data from a table. The WHERE clause filters rows based on conditions. The IN operator allows you to specify multiple values in a WHERE clause, making it easier to filter for multiple specific values.",
            example: "SELECT column1, column2 FROM table_name WHERE column_name IN ('value1', 'value2', 'value3');"
        },
        story: `
            <p class="story-intro"><strong>Dude: Episode 1 - The Genetic Puzzle</strong></p>
            <p>
                Athiyamaan, a powerful politician and Kural's father, sits in his private study staring at medical reports.
                His daughter Kural married her cousin Agan in a family wedding, but something troubles him deeply.
            </p>
            <p>
                "According to these hospital records, both Agan and Kural have O+ blood group," he whispers to himself,
                holding the birth certificate of their newborn son Madasamy. "But the child has AB+ blood group. This is
                genetically impossible!"
            </p>
            <p>
                As someone who once killed his own sister for marrying outside their caste, Athiyamaan knows the importance
                of bloodlines. He opens the hospital database, his hands trembling with both anger and fear.
            </p>
            <p class="quest-prompt">
                <strong>🔍 Query the database to verify the blood groups of the three family members.</strong>
            </p>
        `,
        task: "Query the Patients table to find the blood groups of Agan, Kural, and Madasamy. Select only the patient_name and blood_group columns. Use the IN clause to filter for these three patients.",
        hint: "Use WHERE with IN: SELECT patient_name, blood_group FROM Patients WHERE patient_name IN ('Agan', 'Kural', 'Madasamy')",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 2 &&
                   result.rowCount === 3 &&
                   result.columns.includes('patient_name') &&
                   result.columns.includes('blood_group');
        },
        successMessage: "The database confirms: Agan (O+), Kural (O+), Madasamy (AB+). Athiyamaan's worst fears are confirmed - his daughter's child cannot biologically be from Agan!"
    },
    {
        title: "Mystery Episode 2: The Medical Trail",
        concept: {
            title: "INNER JOIN - Combining Related Tables",
            description: "JOIN (or INNER JOIN) combines rows from two or more tables based on a related column. It returns only the rows where there is a match in both tables. This is essential for connecting related data stored in different tables.",
            example: "SELECT t1.column1, t2.column2\nFROM table1 t1\nJOIN table2 t2 ON t1.id = t2.foreign_id\nWHERE t1.condition = 'value';"
        },
        story: `
            <p class="story-intro"><strong>Dude: Episode 2 - The Medical Trail</strong></p>
            <p>
                Athiyamaan calls his loyal assistant. "I need complete medical records for Kural, especially around
                the time of delivery," he demands. His mind races back to the wedding day when Kural married Agan.
            </p>
            <p>
                "The records are scattered across multiple database tables," the assistant explains. "Patient information
                is in one table, medical records in another. We'll need to connect them."
            </p>
            <p>
                Athiyamaan recalls how Agan, his nephew, had helped Kural with her event-planning business "Surprise Dude."
                They were close as cousins, but was there more to the story? He needs to examine every medical detail.
            </p>
            <p class="quest-prompt">
                <strong>🔍 Use JOIN to connect patient and medical record tables and find all of Kural's medical history.</strong>
            </p>
        `,
        task: "Join the Patients and MedicalRecords tables to find all medical records for Kural. Display patient_name, diagnosis, treatment, doctor_name, and record_date. Use table aliases to make your query cleaner.",
        hint: "Use JOIN with aliases: SELECT p.patient_name, mr.diagnosis, mr.treatment, mr.doctor_name, mr.record_date FROM MedicalRecords mr JOIN Patients p ON mr.patient_id = p.patient_id WHERE p.patient_name = 'Kural'",
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
        successMessage: "The records reveal Kural's prenatal care and delivery history, all handled by Dr. Lakshmi. But nothing here explains how a child with AB+ blood was born to O+ parents..."
    },
    {
        title: "Mystery Episode 3: The Blood Connection",
        concept: {
            title: "WHERE Clause with Comparison Operators",
            description: "The WHERE clause filters database records based on specified conditions. You can use comparison operators (=, !=, <, >, <=, >=) and logical operators (AND, OR, NOT) to create complex filtering conditions. This is fundamental for finding specific data in large datasets.",
            example: "SELECT column1, column2\nFROM table_name\nWHERE condition1 = 'value'\n  AND condition2 > 100;"
        },
        story: `
            <p class="story-intro"><strong>Dude: Episode 3 - The Blood Connection</strong></p>
            <p>
                "There's something I'm missing," Athiyamaan mutters, pacing his study. He recalls Kural telling him
                about her relationship with someone named Pari - a man from a different caste whom she loved before
                the arranged marriage to Agan.
            </p>
            <p>
                "Wait!" His eyes widen. "What if there was a blood donation during delivery? If Kural had complications,
                someone would have donated blood. Let me check who donated to her!"
            </p>
            <p>
                He remembers trying to stop Kural from eloping with Pari, even fabricating stories and using his
                political influence. But what if Pari was still in the picture?
            </p>
            <p class="quest-prompt">
                <strong>🔍 Query the blood donation records to find who donated blood to Kural and when.</strong>
            </p>
        `,
        task: "Query the BloodDonations table to find all donations where the recipient was Kural. Show donor_name, donor_blood_group, donation_date, and hospital_location. Order by donation_date.",
        hint: "Use WHERE clause: SELECT donor_name, donor_blood_group, donation_date, hospital_location FROM BloodDonations WHERE recipient_name = 'Kural' ORDER BY donation_date",
        verifyFunction: (result) => {
            return result.success &&
                   result.columns.length === 4 &&
                   result.rowCount >= 1 &&
                   result.values.some(row => {
                       const donorIndex = result.columns.indexOf('donor_name');
                       const bloodGroupIndex = result.columns.indexOf('donor_blood_group');
                       return row[donorIndex] === 'Pari' && row[bloodGroupIndex] === 'AB+';
                   });
        },
        successMessage: "Shocking discovery! Pari donated AB+ blood to Kural on December 20, 2023 - just days before Madasamy's birth! This connection between Pari and the child's blood group cannot be a coincidence!"
    },
    {
        title: "Mystery Episode 4: The Truth Emerges",
        concept: {
            title: "Filtering and Sorting Results",
            description: "Combining WHERE clause for filtering with ORDER BY for sorting allows you to find and organize specific data efficiently. You can order results in ascending (ASC) or descending (DESC) order. This is crucial for data analysis and finding patterns.",
            example: "SELECT column1, column2, column3\nFROM table_name\nWHERE condition = 'value'\nORDER BY column2 DESC, column1 ASC;"
        },
        story: `
            <p class="story-intro"><strong>Dude: Episode 4 - The Truth Emerges</strong></p>
            <p>
                Athiyamaan's heart pounds as he connects the pieces. "Pari has AB+ blood group... Madasamy has AB+ blood group...
                and Pari donated blood to Kural during delivery," he says aloud, his voice trembling with rage.
            </p>
            <p>
                "I need to find everyone with AB+ blood in this hospital database. If Pari is the biological father,
                the genetics make perfect sense - AB+ from Pari, O+ from Kural could produce AB+ in the child!"
            </p>
            <p>
                His mind flashes back to when he publicly confessed to killing his sister for marrying outside caste,
                only to retract it as a "prank" to save his political career. Now his own daughter has betrayed the family honor.
            </p>
            <p class="quest-prompt">
                <strong>🔍 Find all patients with AB+ blood group and analyze the connection.</strong>
            </p>
        `,
        task: "Query the Patients table to find all patients with AB+ blood group. Show patient_name, blood_group, date_of_birth, and admission_date. Order by admission_date to see the timeline of events.",
        hint: "Use WHERE and ORDER BY: SELECT patient_name, blood_group, date_of_birth, admission_date FROM Patients WHERE blood_group = 'AB+' ORDER BY admission_date",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 2 &&
                   result.columns.includes('admission_date') &&
                   result.values.some(row => {
                       const nameIndex = result.columns.indexOf('patient_name');
                       return row[nameIndex] === 'Pari' || row[nameIndex] === 'Madasamy';
                   });
        },
        successMessage: "The evidence is undeniable! Pari (AB+) was admitted December 18, then donated blood to Kural on December 20, and Madasamy (AB+) was born January 1. The timeline and genetics prove Pari is the biological father!"
    },
    {
        title: "Mystery Episode 5: The Family Truth",
        concept: {
            title: "Complex Queries with Multiple Conditions",
            description: "Advanced SQL queries often require filtering on multiple conditions and displaying relationship data. Understanding parent-child relationships in data, using foreign keys, and connecting multiple pieces of information is essential for solving real-world data problems. This episode demonstrates how databases can reveal complex family relationships and genetic patterns.",
            example: "SELECT person_name, blood_group, \n       parent1_name, parent2_name, \n       child_name\nFROM FamilyRelations\nWHERE blood_group = 'AB+'\n  OR child_name IS NOT NULL;"
        },
        story: `
            <p class="story-intro"><strong>Dude: Episode 5 - The Family Truth</strong></p>
            <p>
                Athiyamaan confronts Kural with all the evidence. Through tears, she confesses everything: her love for Pari,
                the pregnancy, Agan's selfless help in raising Madasamy as his own son, and the planned escape to Canada that
                never happened.
            </p>
            <p>
                "Madasamy is Pari's biological son," she admits. "Agan knew from the beginning and helped me. He even married me
                to protect our family's honor, and took care of the baby with six fingers as if he were his own."
            </p>
            <p>
                Enraged by the betrayal, Athiyamaan orders his men to kill both Agan and the child. But in a twist of redemption,
                when Athiyamaan suffers a heart attack, little Madasamy saves him by calling for help - a plan orchestrated by Agan
                to help the politician face his guilt.
            </p>
            <p class="quest-prompt">
                <strong>🔍 Query the family relations database to see the complete truth of Madasamy's parentage.</strong>
            </p>
        `,
        task: "Query the FamilyRelations table to find all people with AB+ blood group. Show person_name, blood_group, parent1_name, parent2_name, and child_name to reveal the true family connections.",
        hint: "Use WHERE to filter: SELECT person_name, blood_group, parent1_name, parent2_name, child_name FROM FamilyRelations WHERE blood_group = 'AB+'",
        verifyFunction: (result) => {
            return result.success &&
                   result.rowCount >= 2 &&
                   result.columns.length === 5 &&
                   result.values.some(row => {
                       const nameIndex = result.columns.indexOf('person_name');
                       const childIndex = result.columns.indexOf('child_name');
                       return (row[nameIndex] === 'Pari' && row[childIndex] === 'Madasamy') ||
                              (row[nameIndex] === 'Madasamy');
                   });
        },
        successMessage: "The complete truth is revealed! Pari and Kural are Madasamy's biological parents. Moved by the child's innocence and his own redemption, Athiyamaan publicly confesses to his past crimes and accepts imprisonment. Agan finds love with Samyuktha, and Kural finally achieves her freedom. The power of love, sacrifice, and redemption triumphs over hatred and honor violence."
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
        // Show game selection screen
        showGameSelection();

        // Start background music
        playAmbientMusic();

        console.log('Game initialized successfully!');
    }
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
    // Game screens
    gameSelection = document.getElementById('game-selection');
    gameContent = document.querySelector('.game-content');

    // Story and task elements
    storyText = document.getElementById('story-text');
    taskDescription = document.getElementById('task-description');
    hintText = document.getElementById('hint-text');
    chapterIndicator = document.getElementById('chapter-indicator');

    // Concept elements
    conceptBox = document.getElementById('concept-box');
    conceptTitle = document.getElementById('concept-title');
    conceptDescription = document.getElementById('concept-description');
    conceptExample = document.getElementById('concept-example');

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
    backToSelectionBtn = document.getElementById('back-to-selection-btn');

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
    // Game selection buttons
    const selectGameBtns = document.querySelectorAll('.btn-select-game');
    selectGameBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const game = e.target.getAttribute('data-game');
            startGame(game);
        });
    });

    // Back to selection button
    backToSelectionBtn.addEventListener('click', () => {
        playPageTurn();
        showGameSelection();
    });

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
 * Show game selection screen
 */
function showGameSelection() {
    gameSelection.style.display = 'block';
    gameContent.style.display = 'none';
    selectedGame = null;
    gameChapters = [];
}

/**
 * Start a selected game
 */
function startGame(gameType) {
    playPageTurn();
    selectedGame = gameType;
    const game = games[gameType];

    // Extract chapters for this game
    gameChapters = allChapters.slice(game.startChapter, game.endChapter + 1);

    // Hide selection, show game content
    gameSelection.style.display = 'none';
    gameContent.style.display = 'block';

    // Update header subtitle
    const subtitle = document.querySelector('.game-subtitle');
    subtitle.textContent = `${game.icon} ${game.name}`;

    // Start from first chapter of selected game
    currentChapter = 0;
    loadChapter(0);
}

/**
 * Load a specific chapter
 */
function loadChapter(chapterIndex) {
    if (chapterIndex >= gameChapters.length) {
        showVictoryScreen();
        return;
    }

    currentChapter = chapterIndex;
    const chapter = gameChapters[chapterIndex];

    // Update chapter indicator
    chapterIndicator.textContent = `Chapter ${chapterIndex + 1} of ${gameChapters.length}`;

    // Update story
    storyText.innerHTML = chapter.story;

    // Update task
    taskDescription.textContent = chapter.task;

    // Update hint
    hintText.textContent = chapter.hint;

    // Update concept (if available)
    if (chapter.concept && conceptBox) {
        conceptBox.style.display = 'block';
        conceptTitle.textContent = chapter.concept.title;
        conceptDescription.textContent = chapter.concept.description;
        conceptExample.textContent = chapter.concept.example;
    } else if (conceptBox) {
        conceptBox.style.display = 'none';
    }

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
        const chapter = gameChapters[currentChapter];
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
    if (currentChapter < gameChapters.length - 1) {
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
    const game = games[selectedGame];
    const victoryHTML = `
        <div class="victory-screen">
            <div class="victory-content">
                <h1>🎉 ${game.icon} QUEST COMPLETE! 🎉</h1>
                <p>
                    Congratulations, <strong>SQL Master</strong>!
                </p>
                <p>
                    You have conquered all ${gameChapters.length} chapters of <strong>${game.name}</strong>
                    and mastered essential SQL skills!
                </p>
                <p>
                    You have learned:
                    <br>• SELECT statements
                    <br>• WHERE clauses
                    <br>• ORDER BY sorting
                    <br>• JOIN operations
                    <br>• Aggregate functions (SUM, GROUP BY, COUNT)
                </p>
                <p style="margin-top: 2rem;">
                    <strong>Ready for another adventure?</strong>
                </p>
                <button class="btn-restart" onclick="document.querySelector('.victory-screen').remove(); document.getElementById('back-to-selection-btn').click();">
                    🎮 Choose Another Game
                </button>
                <button class="btn-restart" style="margin-top: 1rem;" onclick="location.reload()">
                    🔄 Replay This Quest
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
