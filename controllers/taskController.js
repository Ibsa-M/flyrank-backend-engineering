const tasks = require('../models/taskModel');

const getAllTasks = (req, res) => {
    res.json(tasks);
};
const getTaskById = (req, res) => {
    const taskId = parseInt(req.params.id);

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return res.status(404).json({
            message: 'Task not found'
        });
    }

    res.json(task);
};
const createTask = (req, res) => {
    if (!req.body.title || req.body.title.trim() === '') {
    return res.status(400).json({
        message: 'Title is required'
    });
}
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
};

const updateTask = (req, res) => {

    const taskId = parseInt(req.params.id);

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return res.status(404).json({
            message: 'Task not found'
        });
    }

    if (typeof req.body.completed !== 'boolean') {
        return res.status(400).json({
            message: 'completed must be true or false'
        });
    }

    task.completed = req.body.completed;

    res.json(task);
};

const deleteTask = (req, res) => {
    const taskId = parseInt(req.params.id);

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: 'Task not found'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.status(200).send();
};

module.exports ={
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};