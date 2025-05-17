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

    if (!nombres || !apellidos || !dni || !correo || !telefono || !direccion || !ciudad || !estado || !rol || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

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
        
        await pool.query(query, [nombres, apellidos, dni, codigo, correo, telefono, direccion, calle, ciudad, estado, rol, null, hashedPassword, estatus]);

        res.status(201).json({ message: 'Usuario registrado', codigo });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// 🔐 Login
router.post('/login', async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = results[0];
        const match = await bcrypt.compare(password, usuario.password);

        if (!match) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Generar el token con la información necesaria
        const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, SECRET_KEY, { expiresIn: '1h' });

        // Excluir la contraseña del objeto antes de enviarlo
        delete usuario.password;

        res.json({ 
            message: 'Login exitoso', 
            token, 
            usuario  // Devuelve todos los datos del usuario excepto la contraseña
        });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error al autenticar usuario' });
    }
});


// 👥 Mostrar todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM usuarios');
        
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// ✏️ Editar usuario
router.put('/:id', async (req, res) => {
    const { nombres, apellidos, telefono, direccion, ciudad, estado, foto } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID es obligatorio' });
    }

    try {
        await pool.query(
            'UPDATE usuarios SET nombres=?, apellidos=?, telefono=?, direccion=?, ciudad=?, estado=?, foto=? WHERE id=?',
            [nombres, apellidos, telefono, direccion, ciudad, estado, foto, id]
        );
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        console.error('Error en actualización:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID es requerido' });
    }

    try {
        const [results] = await pool.execute('SELECT * FROM usuarios WHERE id=?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

router.get('/nombre/:nombre', async (req, res) => {
    const { nombre } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE nombres LIKE ?', [`%${nombre}%`]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios con ese nombre' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al buscar usuario por nombre' });
    }
});

router.get('/apellido/:apellido', async (req, res) => {
    const { apellido } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE apellidos LIKE ?', [`%${apellido}%`]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios con ese apellido' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al buscar usuario por apellido' });
    }
});

router.get('/ciudad/:ciudad', async (req, res) => {
    const { ciudad } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE ciudad LIKE ?', [`%${ciudad}%`]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios en esa ciudad' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al buscar usuario por ciudad' });
    }
});

router.get('/rol/:rol', async (req, res) => {
    const { rol } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE rol=?', [rol]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios con ese rol' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al buscar usuario por rol' });
    }
});

router.get('/dni/:dni', async (req, res) => {
    const { rol } = req.params;

    try {
        const [results] = await pool.query('SELECT * FROM usuarios WHERE dni=?', [dni]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron usuarios con ese rol' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en la consulta:', err);
        res.status(500).json({ error: 'Error al buscar usuario por rol' });
    }
});


// 🗑️ Eliminar usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID es obligatorio' });
    }

    try {
        await pool.query('DELETE FROM usuarios WHERE id=?', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        console.error('Error en eliminación:', err);
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// 🔄 Resetear contraseña
router.put('/reset-password/:id', async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;

    if (!password || !id) {
        return res.status(400).json({ error: 'ID y nueva contraseña son obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('UPDATE usuarios SET password=? WHERE id=?', [hashedPassword, id]);
        res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
        console.error('Error en reseteo de contraseña:', err);
        res.status(500).json({ error: 'Error al actualizar contraseña' });
    }
});

// 🏁 Exportar el router
module.exports = router;

// 🔧 Función auxiliar para generar códigos
function generarCodigoUsuario(rol) {
    const prefix = rol === 'Donante' ? 'D' : 'B';
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}
