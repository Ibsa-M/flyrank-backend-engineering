const express = require('express');
const app = express();
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);
app.get('/', (req, res) => {
    res.json({
        name: 'Task API',
        version: '1.0',
        endpoints: [
            '/tasks',
            '/health',
            '/docs'
        ]
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/docs`);
});