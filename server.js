const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '.')));

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API de estado
app.get('/api/status', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Servidor funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

// Exportar para Vercel
module.exports = app;
