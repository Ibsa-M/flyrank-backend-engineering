// const Database = require('better-sqlite3');
// const db = new Database('tasks.db');

// db.exec(`
//     CREATE TABLE IF NOT EXISTS tasks (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL,
//         completed BOOLEAN NOT NULL DEFAULT 0
//     )
// `);

// const count = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

// if (count.count === 0) {
//     const insert = db.prepare('INSERT INTO tasks (title, completed) VALUES (?, ?)');
//     insert.run('Learn Express', 0);
//     insert.run('Build CRUD API', 0);
//     insert.run('Learn SQLite', 0);
// }

// module.exports = db;





const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;