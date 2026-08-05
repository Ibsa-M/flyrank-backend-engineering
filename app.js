const express = require('express');
const app = express();
app.use(express.json());

const tasks = [
    {
        id: 1,
        title: 'Learn Express',
        completed: false
    },
    {
        id: 2,
        title: 'Build CRUD API',
        completed: false
    }
];

app.get('/', (req, res) => {
    res.json({ message: 'Hello!' });
});

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
});

app.post('/tasks', (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        title: req.body.title,
        completed: false
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return res.status(404).json({
            message: 'Task not found'
        });
    }

    task.completed = req.body.completed;

    res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
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
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});