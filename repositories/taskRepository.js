// const db = require("../database");

// const getAllTasks = () => {
//   return db.prepare("SELECT * FROM tasks").all();
// };

// const getTaskById = (id) => {
//   return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
// };

// const createTask = (title) => {
//   const result = db
//     .prepare("INSERT INTO tasks (title, completed) VALUES (?, ?)")
//     .run(title, 0);

//   return db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
// };

// const updateTask = (id, title, completed) => {
//   const result = db
//     .prepare("UPDATE tasks SET title = ?, completed = ? WHERE id = ?")
//     .run(title, completed ? 1 : 0, id);

//   if (result.changes === 0) {
//     return null;
//   }

//   return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
// };

// const deleteTask = (id) => {
//   const result = db
//     .prepare("DELETE FROM tasks WHERE id = ?")
//     .run(id);

//   return result.changes > 0;
// };

// module.exports = {
//   getAllTasks,
//   getTaskById,
//   createTask,
//   updateTask,
//   deleteTask,
// };










const pool = require("../database");

const getAllTasks = async () => {
  const result = await pool.query("SELECT * FROM tasks");
  return result.rows;
};

const getTaskById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const createTask = async (title) => {
  const result = await pool.query(
    "INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *",
    [title, false]
  );
  return result.rows[0];
};

const updateTask = async (id, title, completed) => {
  const result = await pool.query(
    "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *",
    [title, completed, id]
  );

  return result.rows[0] || null;
};

const deleteTask = async (id) => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );

  return result.rowCount > 0;
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};