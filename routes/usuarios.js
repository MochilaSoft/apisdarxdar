const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Usando `mysql2` con promesas
require('dotenv').config();
const multer = require('multer');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'mi_llave_secreta';

// Configuración de almacenamiento para subir imágenes
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// 📌 Registro de usuario
router.post('/registrar', async (req, res) => {
    const {
        nombres, apellidos, dni, correo, telefono, direccion,
        calle, ciudad, estado, rol, password
    } = req.body;

    if (!['Donante', 'Beneficiario'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    try {
        const codigo = generarCodigoUsuario(rol);
        const hashedPassword = await bcrypt.hash(password, 10);
        const estatus = 1;

        const query = `
            INSERT INTO usuarios (
                nombres, apellidos, dni, codigo, correo, telefono, direccion,
                calle, ciudad, estado, rol, foto, password, estatus
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            nombres, apellidos, dni, codigo, correo, telefono, direccion,
            calle, ciudad, estado, rol, null, hashedPassword, estatus
        ];

        const [results] = await pool.query(query, values);
        res.status(201).json({ message: 'Usuario registrado', codigo });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔐 Login
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = results[0];
        const match = await bcrypt.compare(password, usuario.password);
        if (!match) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM usuarios');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Editar usuario
router.put('/:id', async (req, res) => {
    const { nombres, apellidos, telefono, direccion, ciudad, estado, foto } = req.body;
    const { id } = req.params;

    try {
        const query = 'UPDATE usuarios SET nombres=?, apellidos=?, telefono=?, direccion=?, ciudad=?, estado=?, foto=? WHERE id=?';
        const [results] = await pool.query(query, [nombres, apellidos, telefono, direccion, ciudad, estado, foto, id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM usuarios WHERE id=?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔄 Resetear contraseña
router.put('/reset-password/:id', async (req, res) => {
    const { password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hashedPassword, req.params.id]);
        res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔧 Función auxiliar para generar códigos
function generarCodigoUsuario(rol) {
    const prefix = rol === 'Donante' ? 'D' : 'B';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
}

// 👉 Exportar router
module.exports = router;
