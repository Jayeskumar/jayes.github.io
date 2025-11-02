# SNU SQL-Quest: The Data Mage's Journey

An interactive, story-driven fantasy game that teaches SQL basics through an engaging narrative. Built entirely with static web technologies for GitHub Pages deployment.

![Fantasy Theme](https://img.shields.io/badge/Theme-Fantasy-9d4edd)
![SQL Learning](https://img.shields.io/badge/Learn-SQL-4cc9f0)
![Static Site](https://img.shields.io/badge/Type-Static-ffd700)

## Overview

**SNU SQL-Quest** is an educational game where you play as an apprentice Data-Mage on a quest to master SQL. Through 5 progressive chapters, you'll learn:

- `SELECT` statements
- `WHERE` clauses
- `ORDER BY` sorting
- `JOIN` operations
- Aggregate functions (`SUM`, `GROUP BY`)

## Features

- **100% Static**: No server required - runs entirely in the browser
- **Interactive SQL Terminal**: Execute real SQL queries using sql.js
- **Fantasy Theme**: Mystical UI with custom fonts and colors
- **Progressive Learning**: 5 chapters with increasing difficulty
- **Sound Effects**: Audio feedback for success, errors, and navigation
- **Responsive Design**: Works on desktop and mobile devices

## Quick Start

### Option 1: Play Online (Recommended)

If this is deployed on GitHub Pages, visit:
```
https://YOUR-USERNAME.github.io/
```

### Option 2: Run Locally

1. Clone or download this repository
2. Follow the setup instructions below
3. Open `index.html` in a modern web browser

## Setup Instructions

### Step 1: Download Sound Effects (Optional but Recommended)

The game uses sound effects to enhance the experience. Download these free sounds and place them in the `assets/sounds/` folder:

#### Required Sound Files:

1. **success.wav** - A positive chime/fanfare for correct queries
   - [Download from Pixabay](https://pixabay.com/sound-effects/search/success/)
   - Suggested: "Success" or "Level Up" sounds

2. **error.wav** - A short negative sound for incorrect queries
   - [Download from Pixabay](https://pixabay.com/sound-effects/search/error/)
   - Suggested: "Error" or "Buzz" sounds

3. **ambient.mp3** - A looping fantasy/adventure background track
   - [Download from Pixabay](https://pixabay.com/music/search/fantasy/)
   - Suggested: "Medieval" or "Fantasy Adventure" tracks

4. **page-turn.wav** - For advancing story text
   - [Download from Pixabay](https://pixabay.com/sound-effects/search/page-turn/)
   - Suggested: "Page Turn" or "Whoosh" sounds

#### How to Add Sounds:

1. Create the folder structure:
   ```
   assets/
   └── sounds/
       ├── success.wav
       ├── error.wav
       ├── ambient.mp3
       └── page-turn.wav
   ```

2. Download the sound files from the links above
3. Rename them to match the filenames above
4. Place them in the `assets/sounds/` folder

**Note**: The game will work without sound files, but audio feedback won't play.

### Step 2: Verify File Structure

Your project should look like this:

```
jayes.github.io/
├── index.html
├── style.css
├── app.js
├── sql-logic.js
├── README.md
└── assets/
    └── sounds/
        ├── success.wav      (optional)
        ├── error.wav        (optional)
        ├── ambient.mp3      (optional)
        └── page-turn.wav    (optional)
```

### Step 3: Test Locally

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge)
2. The game should load automatically
3. If you see "Database ready!" in the browser console (F12), everything is working!

### Step 4: Deploy to GitHub Pages

#### If you already have a GitHub account:

1. **Create a new repository** (or use an existing one):
   - Go to [GitHub](https://github.com) and sign in
   - Click the "+" icon → "New repository"
   - Name it: `YOUR-USERNAME.github.io` (replace YOUR-USERNAME with your GitHub username)
   - Make it Public
   - Click "Create repository"

2. **Upload your files**:

   **Option A: Using GitHub Web Interface**
   - Click "uploading an existing file"
   - Drag and drop ALL files and folders
   - Click "Commit changes"

   **Option B: Using Git Command Line**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SNU SQL-Quest game"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-USERNAME.github.io.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click "Settings" → "Pages" (in the left sidebar)
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 1-2 minutes for deployment

4. **Visit your game**:
   - Go to: `https://YOUR-USERNAME.github.io/`

## Technical Details

### Technologies Used

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling with custom properties and gradients
- **JavaScript (ES6+)**: Game logic and interactivity
- **[sql.js](https://github.com/sql-js/sql.js)**: SQLite compiled to WebAssembly for in-browser SQL execution

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### How It Works

1. **sql.js Library**: The game uses sql.js (loaded from CDN) which compiles SQLite to WebAssembly, allowing real SQL queries to run entirely in the browser.

2. **In-Memory Database**: On page load, the game creates three tables (Kingdoms, Inventory, Monsters) and populates them with sample data.

3. **Query Execution**: When you submit a query, it's executed against the in-memory database using sql.js.

4. **Validation**: Each chapter has a verification function that checks if your query results match the expected output.

5. **Progression**: Successfully completing a quest unlocks the next chapter.

## Game Chapters

### Chapter 1: The Elder's Library
Learn basic `SELECT` statements to retrieve all data from a table.

### Chapter 2: The Warrior's Challenge
Master the `WHERE` clause to filter data based on conditions.

### Chapter 3: The Monster Threat
Use `WHERE` with multiple conditions and `ORDER BY` for sorting.

### Chapter 4: The Alliance of Kingdoms
Discover `JOIN` operations to combine data from multiple tables.

### Chapter 5: The Final Ritual
Harness aggregate functions with `SUM` and `GROUP BY`.

## Database Schema

### Kingdoms Table
```sql
kingdom_id    INTEGER PRIMARY KEY
kingdom_name  TEXT
ruler         TEXT
population    INTEGER
magic_level   INTEGER
```

### Inventory Table
```sql
item_id       INTEGER PRIMARY KEY
item_name     TEXT
item_type     TEXT (Weapon, Armor, Consumable)
damage        INTEGER
defense       INTEGER
magic_power   INTEGER
kingdom_id    INTEGER (Foreign Key)
```

### Monsters Table
```sql
monster_id    INTEGER PRIMARY KEY
monster_name  TEXT
species       TEXT
health        INTEGER
attack_power  INTEGER
kingdom_id    INTEGER (Foreign Key)
```

## Troubleshooting

### Database doesn't initialize
- Check browser console (F12) for errors
- Make sure you're using a modern browser
- Try refreshing the page
- Verify that sql.js is loading from the CDN (check Network tab in DevTools)

### Sound effects don't play
- Verify sound files are in the correct location: `assets/sounds/`
- Check that filenames match exactly (case-sensitive)
- Some browsers block autoplay - try clicking the music toggle button

### GitHub Pages not deploying
- Wait 2-3 minutes after enabling Pages
- Check that your repository is named correctly: `USERNAME.github.io`
- Verify that `index.html` is in the root directory
- Check Settings → Pages for error messages

## Customization

### Adding More Chapters

Edit `app.js` and add new chapters to the `chapters` array:

```javascript
{
    title: "Chapter 6: Your Title",
    story: `<p>Your story here...</p>`,
    task: "Your task description",
    hint: "Your hint",
    verifyFunction: (result) => {
        // Your verification logic
        return result.success && /* your conditions */;
    },
    successMessage: "Your success message"
}
```

### Changing the Theme

Edit `style.css` and modify the CSS variables in the `:root` section:

```css
:root {
    --primary-bg: #0a0e27;
    --accent-gold: #ffd700;
    /* etc. */
}
```

### Adding More Data

Edit `sql-logic.js` in the `populateTables()` function to add more kingdoms, items, or monsters.

## Credits

- **Game Design & Development**: Created for SQL education
- **SQL Engine**: [sql.js](https://github.com/sql-js/sql.js) by sql.js contributors
- **Fonts**: [Google Fonts](https://fonts.google.com) (Cinzel, MedievalSharp, Spectral)
- **Sound Effects**: [Pixabay](https://pixabay.com) (CC0 License)

## License

This project is open source and available for educational purposes.

## Contributing

Feel free to fork this project and create your own SQL adventures! Some ideas:

- Add more chapters with advanced SQL concepts (HAVING, subqueries, etc.)
- Create different themes (space, underwater, historical)
- Add a hint system with progressive clues
- Implement a scoring system
- Add save/load progress functionality

## Contact

For questions or feedback, please open an issue on GitHub.

---

**Happy Questing, Data-Mage!** ⚔️🔮
