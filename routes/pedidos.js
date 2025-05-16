const express = require('express');
const pool = require('../db'); // Usando mysql2 con promesas
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
        const [results] = await pool.query(query, [iddonante, idbeneficiario, idcarrito, total, codigo]);

        res.status(201).json({ message: 'Pedido registrado con éxito', idpedido: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Actualizar estado de un pedido
router.put('/:idpedido', async (req, res) => {
    const { estatus } = req.body;
    const { idpedido } = req.params;

    if (![0, 1].includes(Number(estatus))) {
        return res.status(400).json({ error: 'El estado debe ser 0 (Rechazado) o 1 (Aprobado)' });
    }

    try {
        const query = 'UPDATE pedidos SET estatus=? WHERE idpedido=?';
        const [results] = await pool.query(query, [estatus, idpedido]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ message: 'Estado del pedido actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar un pedido
router.delete('/:idpedido', async (req, res) => {
    try {
        const query = 'DELETE FROM pedidos WHERE idpedido=?';
        const [result] = await pool.query(query, [req.params.idpedido]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json({ message: 'Pedido eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Mostrar todos los pedidos
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Mostrar un pedido por ID
router.get('/:idpedido', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE idpedido=?', [req.params.idpedido]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Filtrar pedidos por estado (Rechazado/Aprobado)
router.get('/estatus/:estatus', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE estatus=?', [req.params.estatus]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Filtrar pedidos por usuario donante
router.get('/donante/:iddonante', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE iddonante=?', [req.params.iddonante]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Filtrar pedidos por usuario beneficiario
router.get('/beneficiario/:idbeneficiario', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE idbeneficiario=?', [req.params.idbeneficiario]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔢 Filtrar pedidos por código
router.get('/codigo/:codigo', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM pedidos WHERE codigo=?', [req.params.codigo]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Exportar router
module.exports = router;
