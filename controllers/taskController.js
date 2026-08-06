const db = require("../database");

const getAllTasks = (req, res) => {
    let result;

    if (req.query.completed !== undefined) {
        const completed = req.query.completed === "true" ? 1 : 0;

        result = db
            .prepare("SELECT * FROM tasks WHERE completed = ?")
            .all(completed);
    } else {
        result = db
            .prepare("SELECT * FROM tasks")
            .all();
    }

    result = result.map(task => ({
        ...task,
        completed: Boolean(task.completed)
    }));

    res.json(result);
};


const getTaskById = (req, res) => {
    const getTask = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        
        const task = getTask.get(req.params.id);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.completed = Boolean(task.completed);

    res.json(task);
};


const createTask = (req, res) => {
    if (!req.body.title || req.body.title.trim() === "") {
        return res.status(400).json({
            message: "Title is required"
        });
    }

    const insert = db.prepare(
        "INSERT INTO tasks (title, completed) VALUES (?, ?)"
    );

    const info = insert.run(req.body.title, 0);

    const newTask = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(info.lastInsertRowid);

    newTask.completed = Boolean(newTask.completed);

    res.status(201).json(newTask);
};


const updateTask = (req, res) => {

    if (typeof req.body.completed !== "boolean") {
        return res.status(400).json({
            message: "completed must be true or false"
        });
    }

    const update = db.prepare(
        "UPDATE tasks SET completed = ? WHERE id = ?"
    );

    const info = update.run(
        req.body.completed ? 1 : 0,
        req.params.id
    );

    if (info.changes === 0) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(req.params.id);

    task.completed = Boolean(task.completed);

    res.json(task);
};


const deleteTask = (req, res) => {
    const remove = db.prepare("DELETE FROM tasks WHERE id = ?");
    const info = remove.run(req.params.id);

    if (info.changes === 0) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).send();
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};