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
