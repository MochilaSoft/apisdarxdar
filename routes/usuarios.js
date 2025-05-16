const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../db'); // <-- Ruta corregida

const multer = require('multer');
const path = require('path');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'mi_llave_secreta';

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage }); // Ahora 'upload' está definido
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

        connection.query(query, values, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'Usuario registrado', codigo });
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});



// 🔐 Login
router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    connection.query('SELECT * FROM usuarios WHERE correo = ?', [correo], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const usuario = results[0];
        const match = await bcrypt.compare(password, usuario.password);
        if (!match) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token });
    });
});

// Las demás rutas cambian igual, ejemplo:

// 👥 Mostrar todos los usuarios
router.get('/', (req, res) => {
    connection.query('SELECT * FROM usuarios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
// ✏️ Editar usuario
router.put('/usuarios/:id', (req, res) => {
    const { nombres, apellidos, telefono, direccion, ciudad, estado, foto } = req.body;
    const { id } = req.params;

    const query = 'UPDATE usuarios SET nombres=?, apellidos=?, telefono=?, direccion=?, ciudad=?, estado=?, foto=? WHERE id=?';
    connection.query(query, [nombres, apellidos, telefono, direccion, ciudad, estado, foto, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario actualizado' });
    });
});

// 🗑️ Eliminar usuario
router.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    connection.query('DELETE FROM usuarios WHERE id=?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Usuario eliminado' });
    });
});

// 🔍 Mostrar usuario por ID
router.get('/:id', (req, res) => {
    connection.query('SELECT * FROM usuarios WHERE id=?', [req.params.id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(results[0]);
    });
});

// 🏷️ Filtrar por rol (Donante o Beneficiario)
router.get('/usuarios/rol/:rol', (req, res) => {
    connection.query('SELECT * FROM usuarios WHERE rol=?', [req.params.rol], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(results);
    });
});

// 🌍 Filtrar por ciudad
router.get('/usuarios/ciudad/:ciudad', (req, res) => {
    connection.query('SELECT * FROM usuarios WHERE ciudad=?', [req.params.ciudad], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔢 Filtrar por código
router.get('/usuarios/codigo/:codigo', (req, res) => {
    connection.query('SELECT * FROM usuarios WHERE codigo=?', [req.params.codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🆔 Filtrar por DNI
router.get('/usuarios/dni/:dni', (req, res) => {
    connection.query('SELECT * FROM usuarios WHERE dni=?', [req.params.dni], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔄 Resetear contraseña
router.put('/usuarios/reset-password/:id', async (req, res) => {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    connection.query('UPDATE usuarios SET password=? WHERE id=?', [hashedPassword, req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Contraseña actualizada' });
    });
});
// ... todas las otras rutas igual pero usando `router.METODO` en vez de `app.METODO`

// 👉 Al final, exportar el router
module.exports = router;

// 🔧 Función auxiliar para generar códigos
function generarCodigoUsuario(rol) {
    const prefix = rol === 'Donante' ? 'D' : 'B';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
}
