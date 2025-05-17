const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); 
require('dotenv').config();
const multer = require('multer');
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || 'mi_llave_secreta';

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// 📌 Registro de usuario
router.post('/registrar', async (req, res) => {
    const { nombres, apellidos, dni, correo, telefono, direccion, calle, ciudad, estado, rol, password } = req.body;

    if (!['Donante', 'Beneficiario'].includes(rol)) {
        return res.status(400).json({ error: 'Rol inválido' });
    }

    try {
        const codigo = generarCodigoUsuario(rol);
        const hashedPassword = await bcrypt.hash(password, 10);
        const estatus = 1;

        const query = `
            INSERT INTO usuarios (nombres, apellidos, dni, codigo, correo, telefono, direccion, calle, ciudad, estado, rol, foto, password, estatus) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await pool.execute(query, [nombres, apellidos, dni, codigo, correo, telefono, direccion, calle, ciudad, estado, rol, null, hashedPassword, estatus]);

        res.status(201).json({ message: 'Usuario registrado', codigo });
    } catch (err) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// 🔐 Login
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    try {
        const [results] = await pool.execute('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (!match) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: 'Login exitoso', token });
    } catch (err) {
        res.status(500).json({ error: 'Error al autenticar usuario' });
    }
});

// 👥 Mostrar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM usuarios');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ✏️ Editar usuario
router.put('/:id', async (req, res) => {
    const { nombres, apellidos, telefono, direccion, ciudad, estado, foto } = req.body;
    const { id } = req.params;

    try {
        await pool.execute(
            'UPDATE usuarios SET nombres=?, apellidos=?, telefono=?, direccion=?, ciudad=?, estado=?, foto=? WHERE id=?', 
            [nombres, apellidos, telefono, direccion, ciudad, estado, foto, id]
        );
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

// 🗑️ Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM usuarios WHERE id=?', [req.params.id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// 🔍 Mostrar usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM usuarios WHERE id=?', [req.params.id]);
        if (results.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

// 🏷️ Filtrar por rol, ciudad, código y DNI
router.get('/rol/:rol', async (req, res) => filterByField('rol', req.params.rol, res));
router.get('/ciudad/:ciudad', async (req, res) => filterByField('ciudad', req.params.ciudad, res));
router.get('/codigo/:codigo', async (req, res) => filterByField('codigo', req.params.codigo, res));
router.get('/dni/:dni', async (req, res) => filterByField('dni', req.params.dni, res));

// 🔄 Resetear contraseña
router.put('/reset-password/:id', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await pool.execute('UPDATE usuarios SET password=? WHERE id=?', [hashedPassword, req.params.id]);
        res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
});

// 🔧 Función para filtrar usuarios
async function filterByField(field, value, res) {
    try {
        const [results] = await pool.execute(`SELECT * FROM usuarios WHERE ${field}=?`, [value]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: `Error al filtrar por ${field}` });
    }
}

// 🏁 Exportar el router
module.exports = router;

// 🔧 Función auxiliar para generar códigos
function generarCodigoUsuario(rol) {
    const prefix = rol === 'Donante' ? 'D' : 'B';
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}
