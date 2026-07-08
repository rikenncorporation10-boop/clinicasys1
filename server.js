// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1007870972Kr*',  // <--- Cambia esto por tu contraseña
    database: 'clinicasys_db'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// ============================================================
// RUTAS DE LA API (ENDPOINTS)
// ============================================================

// 1. OBTENER TODOS LOS PACIENTES
app.get('/api/pacientes', (req, res) => {
    db.query('SELECT * FROM pacientes', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// 2. OBTENER UN PACIENTE POR ID
app.get('/api/pacientes/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM pacientes WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results[0] || {});
    });
});

// 3. CREAR UN NUEVO PACIENTE
app.post('/api/pacientes', (req, res) => {
    const { documento, nombre, apellido, telefono, eps } = req.body;
    db.query(
        'INSERT INTO pacientes (documento, nombre, apellido, telefono, eps) VALUES (?, ?, ?, ?, ?)',
        [documento, nombre, apellido, telefono, eps],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                message: 'Paciente creado correctamente',
                id: result.insertId 
            });
        }
    );
});

// 4. OBTENER TODAS LAS CITAS
app.get('/api/citas', (req, res) => {
    db.query(`
        SELECT c.*, p.nombre as paciente_nombre, u.nombre as medico_nombre 
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN usuarios u ON c.medico_id = u.id
    `, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// 5. CREAR UNA NUEVA CITA
app.post('/api/citas', (req, res) => {
    const { paciente_id, medico_id, fecha, motivo } = req.body;
    db.query(
        'INSERT INTO citas (paciente_id, medico_id, fecha, motivo) VALUES (?, ?, ?, ?)',
        [paciente_id, medico_id, fecha, motivo],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                message: 'Cita creada correctamente',
                id: result.insertId 
            });
        }
    );
});

// 6. OBTENER TODOS LOS MEDICAMENTOS
app.get('/api/medicamentos', (req, res) => {
    db.query('SELECT * FROM medicamentos', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// 7. ACTUALIZAR STOCK DE MEDICAMENTO
app.put('/api/medicamentos/:id/stock', (req, res) => {
    const id = req.params.id;
    const { stock } = req.body;
    db.query(
        'UPDATE medicamentos SET stock = ? WHERE id = ?',
        [stock, id],
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ 
                success: true, 
                message: 'Stock actualizado correctamente'
            });
        }
    );
});

// 8. OBTENER ESTADÍSTICAS PARA EL DASHBOARD
app.get('/api/dashboard/stats', (req, res) => {
    const queries = {
        total_pacientes: 'SELECT COUNT(*) as total FROM pacientes',
        citas_hoy: 'SELECT COUNT(*) as total FROM citas WHERE DATE(fecha) = CURDATE()',
        medicamentos_bajo: 'SELECT COUNT(*) as total FROM medicamentos WHERE stock < 10'
    };

    let results = {};
    let completed = 0;
    const total = Object.keys(queries).length;

    for (let key in queries) {
        db.query(queries[key], (err, result) => {
            if (err) {
                results[key] = { error: err.message };
            } else {
                results[key] = result[0];
            }
            completed++;
            if (completed === total) {
                res.json(results);
            }
        });
    }
});

// 9. LOGIN DE USUARIO
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query(
        'SELECT * FROM usuarios WHERE username = ? AND password = ?',
        [username, password],
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (results.length === 0) {
                res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
                return;
            }
            res.json({
                success: true,
                usuario: {
                    id: results[0].id,
                    nombre: results[0].nombre,
                    rol: results[0].rol
                }
            });
        }
    );
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});