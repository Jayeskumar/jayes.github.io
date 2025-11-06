// ============================================
// SNU SQL-Quest: SQL Database Logic
// ============================================

// Global database instance
let db = null;
let SQL = null;

/**
 * Initialize the sql.js library and create the database
 */
async function initDatabase() {
    try {
        console.log('Initializing SQL.js...');

        // Initialize sql.js with the WASM file
        SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        console.log('SQL.js initialized successfully!');

        // Create a new database
        db = new SQL.Database();

        console.log('Database created!');

        // Create tables and populate with data
        createTables();
        populateTables();

        console.log('Database ready!');

        return true;
    } catch (error) {
        console.error('Failed to initialize database:', error);
        alert('Failed to initialize the SQL database. Please refresh the page and try again.');
        return false;
    }
}

/**
 * Create the game database tables
 */
function createTables() {
    console.log('Creating tables...');

    // Table 1: Kingdoms
    db.run(`
        CREATE TABLE Kingdoms (
            kingdom_id INTEGER PRIMARY KEY,
            kingdom_name TEXT NOT NULL,
            ruler TEXT NOT NULL,
            population INTEGER,
            magic_level INTEGER
        );
    `);

    // Table 2: Inventory
    db.run(`
        CREATE TABLE Inventory (
            item_id INTEGER PRIMARY KEY,
            item_name TEXT NOT NULL,
            item_type TEXT NOT NULL,
            damage INTEGER,
            defense INTEGER,
            magic_power INTEGER,
            kingdom_id INTEGER,
            FOREIGN KEY (kingdom_id) REFERENCES Kingdoms(kingdom_id)
        );
    `);

    // Table 3: Monsters
    db.run(`
        CREATE TABLE Monsters (
            monster_id INTEGER PRIMARY KEY,
            monster_name TEXT NOT NULL,
            species TEXT NOT NULL,
            health INTEGER,
            attack_power INTEGER,
            kingdom_id INTEGER,
            FOREIGN KEY (kingdom_id) REFERENCES Kingdoms(kingdom_id)
        );
    `);

    // Table 4: Doraemon Gadgets
    db.run(`
        CREATE TABLE Gadgets (
            gadget_id INTEGER PRIMARY KEY,
            gadget_name TEXT NOT NULL,
            category TEXT NOT NULL,
            power_level INTEGER,
            uses_remaining INTEGER,
            first_appearance_year INTEGER,
            description TEXT
        );
    `);

    // Table 5: Gadget Usage Log
    db.run(`
        CREATE TABLE GadgetUsage (
            usage_id INTEGER PRIMARY KEY,
            gadget_id INTEGER,
            user_name TEXT NOT NULL,
            usage_date TEXT,
            success_rate INTEGER,
            adventure_type TEXT,
            FOREIGN KEY (gadget_id) REFERENCES Gadgets(gadget_id)
        );
    `);

    // Table 6: Hospital Patients
    db.run(`
        CREATE TABLE Patients (
            patient_id INTEGER PRIMARY KEY,
            patient_name TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            date_of_birth TEXT,
            admission_date TEXT,
            ward_number INTEGER
        );
    `);

    // Table 7: Medical Records
    db.run(`
        CREATE TABLE MedicalRecords (
            record_id INTEGER PRIMARY KEY,
            patient_id INTEGER,
            diagnosis TEXT,
            treatment TEXT,
            doctor_name TEXT,
            record_date TEXT,
            FOREIGN KEY (patient_id) REFERENCES Patients(patient_id)
        );
    `);

    // Table 8: Blood Donations
    db.run(`
        CREATE TABLE BloodDonations (
            donation_id INTEGER PRIMARY KEY,
            donor_name TEXT NOT NULL,
            donor_blood_group TEXT NOT NULL,
            recipient_name TEXT,
            donation_date TEXT,
            hospital_location TEXT
        );
    `);

    // Table 9: Family Relations
    db.run(`
        CREATE TABLE FamilyRelations (
            relation_id INTEGER PRIMARY KEY,
            person_name TEXT NOT NULL,
            blood_group TEXT NOT NULL,
            parent1_name TEXT,
            parent2_name TEXT,
            child_name TEXT
        );
    `);

    console.log('Tables created successfully!');
}

/**
 * Populate tables with sample data
 */
function populateTables() {
    console.log('Populating tables with data...');

    // Insert data into Kingdoms
    const kingdomsData = [
        [1, 'Eldoria', 'Archmage Valerius', 50000, 9],
        [2, 'Shadowmere', 'Dark Lord Malakai', 30000, 7],
        [3, 'Crystalheim', 'Queen Seraphina', 45000, 8],
        [4, 'Ironforge', 'King Thorin', 60000, 5],
        [5, 'Mystic Vale', 'Elder Druid Elara', 25000, 10]
    ];

    kingdomsData.forEach(data => {
        db.run(
            'INSERT INTO Kingdoms VALUES (?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into Inventory
    const inventoryData = [
        [1, 'Sword of Light', 'Weapon', 15, 0, 5, 1],
        [2, 'Dragon Sword', 'Weapon', 25, 0, 10, 2],
        [3, 'Crystal Staff', 'Weapon', 10, 0, 20, 3],
        [4, 'Iron Shield', 'Armor', 0, 30, 0, 4],
        [5, 'Mystic Robe', 'Armor', 0, 15, 15, 5],
        [6, 'Fire Bow', 'Weapon', 18, 0, 8, 1],
        [7, 'Shadow Dagger', 'Weapon', 12, 0, 6, 2],
        [8, 'Healing Potion', 'Consumable', 0, 0, 10, 3],
        [9, 'Mana Elixir', 'Consumable', 0, 0, 15, 5],
        [10, 'Diamond Armor', 'Armor', 0, 50, 5, 3],
        [11, 'Thunder Hammer', 'Weapon', 30, 0, 5, 4],
        [12, 'Stealth Cloak', 'Armor', 0, 20, 10, 2]
    ];

    inventoryData.forEach(data => {
        db.run(
            'INSERT INTO Inventory VALUES (?, ?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into Monsters
    const monstersData = [
        [1, 'Fire Drake', 'Dragon', 500, 80, 1],
        [2, 'Shadow Wraith', 'Undead', 300, 60, 2],
        [3, 'Crystal Golem', 'Elemental', 800, 50, 3],
        [4, 'Iron Ogre', 'Giant', 600, 70, 4],
        [5, 'Forest Sprite', 'Fae', 150, 30, 5],
        [6, 'Dark Sorcerer', 'Humanoid', 400, 90, 2],
        [7, 'Mountain Troll', 'Giant', 700, 65, 4],
        [8, 'Phoenix', 'Mythical', 450, 85, 1],
        [9, 'Ice Wyrm', 'Dragon', 550, 75, 3],
        [10, 'Void Walker', 'Demon', 900, 100, 2]
    ];

    monstersData.forEach(data => {
        db.run(
            'INSERT INTO Monsters VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into Gadgets
    const gadgetsData = [
        [1, 'Anywhere Door', 'Transportation', 95, 100, 1970, 'A door that can take you anywhere you want'],
        [2, 'Take-copter', 'Transportation', 70, 50, 1970, 'A small helicopter blade that fits on your head'],
        [3, 'Time Machine', 'Time Travel', 100, 10, 1970, 'A machine that allows time travel to past and future'],
        [4, 'Shrink Ray', 'Size Manipulation', 85, 30, 1973, 'A ray gun that can shrink objects and people'],
        [5, 'Big Light', 'Size Manipulation', 85, 30, 1974, 'A flashlight that makes things bigger'],
        [6, 'Memory Bread', 'Education', 60, 20, 1975, 'Bread that helps memorize anything printed on it'],
        [7, 'Translation Jelly', 'Communication', 75, 25, 1976, 'Jelly that allows understanding any language'],
        [8, 'Copying Toast', 'Duplication', 80, 15, 1977, 'Toast that creates copies of objects'],
        [9, 'What-If Phone Booth', 'Reality Alteration', 90, 5, 1978, 'A phone booth that creates alternate realities'],
        [10, 'Spare Pocket', 'Storage', 88, 40, 1979, 'An extra pocket with infinite storage space'],
        [11, 'Time Cloth', 'Time Manipulation', 92, 12, 1980, 'A cloth that can age or de-age objects'],
        [12, 'Gulliver Tunnel', 'Size Manipulation', 78, 22, 1981, 'A tunnel that changes size of whatever passes through']
    ];

    gadgetsData.forEach(data => {
        db.run(
            'INSERT INTO Gadgets VALUES (?, ?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into GadgetUsage
    const gadgetUsageData = [
        [1, 1, 'Nobita', '2024-01-15', 95, 'School Adventure'],
        [2, 1, 'Shizuka', '2024-01-20', 98, 'Shopping Trip'],
        [3, 2, 'Nobita', '2024-01-22', 85, 'Sky Exploration'],
        [4, 3, 'Doraemon', '2024-02-01', 100, 'Dinosaur Era'],
        [5, 4, 'Suneo', '2024-02-10', 70, 'Prank'],
        [6, 5, 'Gian', '2024-02-15', 75, 'Concert Setup'],
        [7, 6, 'Nobita', '2024-03-01', 60, 'Exam Preparation'],
        [8, 7, 'Shizuka', '2024-03-10', 90, 'Foreign Trip'],
        [9, 8, 'Nobita', '2024-03-20', 80, 'Homework Help'],
        [10, 9, 'Doraemon', '2024-04-01', 95, 'Reality Experiment'],
        [11, 10, 'Nobita', '2024-04-15', 88, 'Treasure Hunt'],
        [12, 11, 'Doraemon', '2024-05-01', 92, 'Restoration Project']
    ];

    gadgetUsageData.forEach(data => {
        db.run(
            'INSERT INTO GadgetUsage VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into Patients (including characters from the Tamil movie)
    const patientsData = [
        [1, 'Agan', 'O+', '1995-03-15', '2024-01-10', 101],
        [2, 'Kural', 'O+', '1997-06-20', '2023-12-15', 102],
        [3, 'Madasamy', 'AB+', '2024-01-01', '2024-01-05', 103],
        [4, 'Pari', 'AB+', '1994-05-18', '2023-12-18', 104],
        [5, 'Athiyamaan', 'A+', '1965-03-10', '2024-01-20', 105],
        [6, 'Selvi', 'B+', '1994-12-05', '2024-02-01', 106],
        [7, 'Rajan', 'A+', '1992-04-25', '2024-01-15', 107],
        [8, 'Meena', 'O-', '1996-09-30', '2024-02-10', 108],
        [9, 'Prakash', 'AB-', '1991-11-12', '2023-12-20', 109],
        [10, 'Lakshmi', 'A-', '1998-02-14', '2024-01-25', 110],
        [11, 'Vijay', 'B-', '1990-07-08', '2024-02-05', 111]
    ];

    patientsData.forEach(data => {
        db.run(
            'INSERT INTO Patients VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into MedicalRecords
    const medicalRecordsData = [
        [1, 1, 'Regular Checkup', 'Routine examination', 'Dr. Ramanathan', '2024-01-10'],
        [2, 2, 'Prenatal Care', 'Pregnancy monitoring', 'Dr. Lakshmi', '2023-12-15'],
        [3, 3, 'Newborn Care', 'Post-birth examination with 6 fingers', 'Dr. Kumar', '2024-01-05'],
        [4, 4, 'Blood Test', 'Routine blood analysis', 'Dr. Selvan', '2023-12-18'],
        [5, 5, 'Heart Disease', 'Cardiac examination', 'Dr. Priya', '2024-01-20'],
        [6, 2, 'Delivery', 'Normal delivery of baby boy', 'Dr. Lakshmi', '2024-01-01'],
        [7, 3, 'Blood Group Test', 'Confirmed AB+ blood group', 'Dr. Kumar', '2024-01-06'],
        [8, 4, 'General Checkup', 'Pre-relationship medical examination', 'Dr. Ramanathan', '2023-12-18'],
        [9, 6, 'Vaccination', 'Annual flu shot', 'Dr. Priya', '2024-02-01']
    ];

    medicalRecordsData.forEach(data => {
        db.run(
            'INSERT INTO MedicalRecords VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into BloodDonations
    const bloodDonationsData = [
        [1, 'Pari', 'AB+', 'Emergency Pool', '2023-10-15', 'Chennai General Hospital'],
        [2, 'Rajan', 'A+', 'Blood Bank', '2023-11-01', 'Chennai General Hospital'],
        [3, 'Prakash', 'AB-', 'Emergency Pool', '2023-11-10', 'Chennai General Hospital'],
        [4, 'Vijay', 'B-', 'Blood Bank', '2023-12-01', 'Chennai General Hospital'],
        [5, 'Meena', 'O-', 'Universal Donor Pool', '2023-12-10', 'Chennai General Hospital'],
        [6, 'Selvi', 'B+', 'Blood Bank', '2024-01-05', 'Chennai General Hospital'],
        [7, 'Pari', 'AB+', 'Kural', '2023-12-20', 'Chennai General Hospital'],
        [8, 'Agan', 'O+', 'Blood Bank', '2024-01-10', 'Chennai General Hospital']
    ];

    bloodDonationsData.forEach(data => {
        db.run(
            'INSERT INTO BloodDonations VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    // Insert data into FamilyRelations
    const familyRelationsData = [
        [1, 'Agan', 'O+', 'Ravi', 'Meera', null],
        [2, 'Kural', 'O+', 'Athiyamaan', 'Kamala', 'Madasamy'],
        [3, 'Madasamy', 'AB+', 'Pari', 'Kural', null],
        [4, 'Pari', 'AB+', 'Murugan', 'Saraswathi', 'Madasamy'],
        [5, 'Selvi', 'B+', 'Raman', 'Parvathi', null],
        [6, 'Athiyamaan', 'A+', 'Selvam', 'Lakshmi', 'Kural'],
        [7, 'Kamala', 'B+', null, null, 'Kural']
    ];

    familyRelationsData.forEach(data => {
        db.run(
            'INSERT INTO FamilyRelations VALUES (?, ?, ?, ?, ?, ?)',
            data
        );
    });

    console.log('Tables populated successfully!');
}

/**
 * Execute a SQL query and return results
 * @param {string} query - The SQL query to execute
 * @returns {Object} - Object containing success status, results, and error message
 */
function executeQuery(query) {
    try {
        // Clean up the query
        query = query.trim();

        // Check if query is empty
        if (!query) {
            return {
                success: false,
                error: 'Please enter a SQL query.',
                results: null
            };
        }

        // Execute the query
        const results = db.exec(query);

        // Check if query returned results
        if (results.length === 0) {
            return {
                success: true,
                results: [],
                columns: [],
                values: [],
                rowCount: 0
            };
        }

        // Format results
        const formattedResults = {
            success: true,
            results: results,
            columns: results[0].columns,
            values: results[0].values,
            rowCount: results[0].values.length
        };

        return formattedResults;

    } catch (error) {
        console.error('Query execution error:', error);
        return {
            success: false,
            error: error.message || 'An error occurred while executing the query.',
            results: null
        };
    }
}

/**
 * Verify if the query results match expected results
 * @param {Array} actualResults - The actual query results
 * @param {Array} expectedResults - The expected query results
 * @returns {boolean} - True if results match, false otherwise
 */
function verifyResults(actualResults, expectedResults) {
    // Check if both are arrays
    if (!Array.isArray(actualResults) || !Array.isArray(expectedResults)) {
        return false;
    }

    // Check if lengths match
    if (actualResults.length !== expectedResults.length) {
        return false;
    }

    // Check if all values match
    for (let i = 0; i < actualResults.length; i++) {
        const actualRow = actualResults[i];
        const expectedRow = expectedResults[i];

        if (!Array.isArray(actualRow) || !Array.isArray(expectedRow)) {
            return false;
        }

        if (actualRow.length !== expectedRow.length) {
            return false;
        }

        for (let j = 0; j < actualRow.length; j++) {
            if (actualRow[j] !== expectedRow[j]) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Verify query results by column count and row count
 * @param {Object} queryResult - The query result object from executeQuery
 * @param {number} expectedColumnCount - Expected number of columns
 * @param {number} expectedRowCount - Expected number of rows
 * @returns {boolean} - True if counts match, false otherwise
 */
function verifyResultStructure(queryResult, expectedColumnCount, expectedRowCount) {
    if (!queryResult.success) {
        return false;
    }

    if (queryResult.columns.length !== expectedColumnCount) {
        return false;
    }

    if (queryResult.rowCount !== expectedRowCount) {
        return false;
    }

    return true;
}

/**
 * Get all data from a specific table (for verification purposes)
 * @param {string} tableName - Name of the table
 * @returns {Object} - Query results
 */
function getTableData(tableName) {
    return executeQuery(`SELECT * FROM ${tableName}`);
}

/**
 * Check if query contains specific SQL keywords
 * @param {string} query - The SQL query
 * @param {Array<string>} keywords - Array of keywords to check for
 * @returns {boolean} - True if all keywords are found
 */
function queryContainsKeywords(query, keywords) {
    const upperQuery = query.toUpperCase();
    return keywords.every(keyword => upperQuery.includes(keyword.toUpperCase()));
}

// Export functions for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initDatabase,
        executeQuery,
        verifyResults,
        verifyResultStructure,
        getTableData,
        queryContainsKeywords
    };
}
