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

    res.json({
        message: 'Task deleted successfully',
        task: deletedTask[0]
    });
};

module.exports ={
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};