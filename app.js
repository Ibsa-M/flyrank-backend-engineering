require('dotenv').config();
const express = require('express');
const app = express();
const supabase = require('./config/supabase');
const requireAuth = require('./middleware/authMiddleware');
app.use(express.json());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const taskRoutes = require('./routes/taskRoutes');
app.use('/auth', require('./routes/authRoutes'));
app.use('/tasks', taskRoutes);
app.get('/', (req, res) => {
    res.json({
        name: 'Task API',
        version: '1.0',
        endpoints: [
            '/tasks',
            '/auth',
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/docs`);
});

app.get('/public/info', (req, res) => {
    res.json({
        message: 'This is a public route'
    });
});

app.get('/protected/profile', requireAuth, (req, res) => {
    res.json({
        message: 'Protected profile',
        user: req.user
    });
});

app.get('/protected/dashboard', requireAuth, (req, res) => {
    res.json({
        message: 'Protected dashboard',
        user: req.user
    });
});