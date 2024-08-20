const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Create the leaderboard table
db.serialize(() => {
  db.run(`CREATE TABLE leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
  )`);
});

// POST endpoint to add a new score
app.post('/leaderboard', (req, res) => {
  const { name, score } = req.body;
  const stmt = db.prepare('INSERT INTO leaderboard (name, score) VALUES (?, ?)');
  stmt.run(name, score, function(err) {
    if (err) {
      res.status(500).send('Error inserting score');
    } else {
      res.status(201).send('Score added');
    }
    stmt.finalize();
  });
});

// GET endpoint to retrieve the top 10 scores
app.get('/leaderboard', (req, res) => {
  db.all('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 10', [], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching leaderboard');
    } else {
      res.json(rows);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
