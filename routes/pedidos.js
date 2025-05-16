const express = require('express');
const connection = require('../db'); // <-- Ruta corregida

const router = express.Router();

// 📌 Registrar un pedido
router.post('/pedidos', (req, res) => {
    const { iddonante, idbeneficiario, idcarrito, total, codigo } = req.body;

    if (!iddonante || !idbeneficiario || !idcarrito || !total || !codigo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const query = 'INSERT INTO pedidos (iddonante, idbeneficiario, idcarrito, total, codigo) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [iddonante, idbeneficiario, idcarrito, total, codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Pedido registrado con éxito', idpedido: results.insertId });
    });
});

// ✏️ Actualizar estado de un pedido
router.put('/pedidos/:idpedido', (req, res) => {
    const { estatus } = req.body;
    const { idpedido } = req.params;

    if (![0, 1].includes(Number(estatus))) {
        return res.status(400).json({ error: 'El estado debe ser 0 (Rechazado) o 1 (Aprobado)' });
    }

    const query = 'UPDATE pedidos SET estatus=? WHERE idpedido=?';
    connection.query(query, [estatus, idpedido], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Estado del pedido actualizado' });
    });
});

// 🗑️ Eliminar un pedido
router.delete('/pedidos/:idpedido', (req, res) => {
    const { idpedido } = req.params;

    connection.query('DELETE FROM pedidos WHERE idpedido=?', [idpedido], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Pedido eliminado' });
    });
});

// 👥 Mostrar todos los pedidos
router.get('/pedidos', (req, res) => {
    connection.query('SELECT * FROM pedidos', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 Mostrar un pedido por ID
router.get('/pedidos/:idpedido', (req, res) => {
    connection.query('SELECT * FROM pedidos WHERE idpedido=?', [req.params.idpedido], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(results[0]);
    });
});

// 📌 Filtrar pedidos por estado (Rechazado/Aprobado)
router.get('/pedidos/estatus/:estatus', (req, res) => {
    connection.query('SELECT * FROM pedidos WHERE estatus=?', [req.params.estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 Filtrar pedidos por usuario donante
router.get('/pedidos/donante/:iddonante', (req, res) => {
    connection.query('SELECT * FROM pedidos WHERE iddonante=?', [req.params.iddonante], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 Filtrar pedidos por usuario beneficiario
router.get('/pedidos/beneficiario/:idbeneficiario', (req, res) => {
    connection.query('SELECT * FROM pedidos WHERE idbeneficiario=?', [req.params.idbeneficiario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔢 Filtrar pedidos por código
router.get('/pedidos/codigo/:codigo', (req, res) => {
    connection.query('SELECT * FROM pedidos WHERE codigo=?', [req.params.codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports= router;