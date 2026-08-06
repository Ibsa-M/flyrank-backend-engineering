const express = require('express');
const app = express();
app.use(express.json());

const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Hello!' });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});