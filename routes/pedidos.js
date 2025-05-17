const express = require('express');
const pool = require('../db'); // Usando `pool` para `async/await`
require('dotenv').config();
const router = express.Router();

// 📌 Registrar un pedido
router.post('/', async (req, res) => {
    const { iddonante, idbeneficiario, idcarrito, total, codigo } = req.body;

    if (!iddonante || !idbeneficiario || !idcarrito || !total || !codigo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const query = 'INSERT INTO pedidos (iddonante, idbeneficiario, idcarrito, total, codigo) VALUES (?, ?, ?, ?, ?)';
        const [result] = await pool.query(query, [iddonante, idbeneficiario, idcarrito, total, codigo]);

        res.status(201).json({ message: 'Pedido registrado con éxito', idpedido: result.insertId });
    } catch (err) {
        console.error('Error al registrar pedido:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Actualizar estado de un pedido
router.put('/:id', async (req, res) => {
    const { estatus } = req.body;
    const { id } = req.params;

    if (!id || ![0, 1].includes(Number(estatus))) {
        return res.status(400).json({ error: 'El estado debe ser 0 (Rechazado) o 1 (Aprobado)' });
    }

    try {
        const query = 'UPDATE pedidos SET estatus=? WHERE id=?';
        await pool.query(query, [estatus, id]);

        res.json({ message: 'Estado del pedido actualizado' });
    } catch (err) {
        console.error('Error al actualizar pedido:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar un pedido
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID del pedido es obligatorio' });
    }

    try {
        await pool.query('DELETE FROM pedidos WHERE id=?', [id]);
        res.json({ message: 'Pedido eliminado' });
    } catch (err) {
        console.error('Error al eliminar pedido:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👥 Mostrar todos los pedidos
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Mostrar un pedido por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID del pedido es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE id=?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener pedido:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📌 Filtrar pedidos por estado (Rechazado/Aprobado)
router.get('/estatus/:estatus', async (req, res) => {
    const { estatus } = req.params;

    if (![0, 1].includes(Number(estatus))) {
        return res.status(400).json({ error: 'El estado debe ser 0 (Rechazado) o 1 (Aprobado)' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE estatus=?', [estatus]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron pedidos con ese estado' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por estado:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Filtrar pedidos por usuario donante
router.get('/donante/:iddonante', async (req, res) => {
    const { iddonante } = req.params;

    if (!iddonante) {
        return res.status(400).json({ error: 'ID del donante es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE iddonante=?', [iddonante]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron pedidos de este donante' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por donante:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Filtrar pedidos por usuario beneficiario
router.get('/beneficiario/:idbeneficiario', async (req, res) => {
    const { idbeneficiario } = req.params;

    if (!idbeneficiario) {
        return res.status(400).json({ error: 'ID del beneficiario es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE idbeneficiario=?', [idbeneficiario]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron pedidos para este beneficiario' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por beneficiario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔢 Filtrar pedidos por código
router.get('/codigo/:codigo', async (req, res) => {
    const { codigo } = req.params;

    if (!codigo) {
        return res.status(400).json({ error: 'Código del pedido es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE codigo=?', [codigo]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontró un pedido con ese código' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por código:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏁 Exportar el router
module.exports = router;
