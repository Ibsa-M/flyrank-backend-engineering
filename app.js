const express = require('express');
const app = express();
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const taskRoutes = require('./routes/taskRoutes');
app.use('/tasks', taskRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Hello!' });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/api-docs`);
});