const express = require('express');
const connection = require('../db'); // <-- Ruta corregida
require('dotenv').config();
const router = express.Router();

// 📌 Crear un carrito
router.post('/carrito', (req, res) => {
    const { estatus } = req.body;

    if (!['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    const query = 'INSERT INTO carrito (estatus) VALUES (?)';
    connection.query(query, [estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Carrito creado', idcarrito: results.insertId });
    });
});

// ✏️ Editar un carrito
router.put('/carrito/:idcarrito', (req, res) => {
    const { estatus } = req.body;
    const { idcarrito } = req.params;

    if (!['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    const query = 'UPDATE carrito SET estatus=? WHERE idcarrito=?';
    connection.query(query, [estatus, idcarrito], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Carrito actualizado' });
    });
});

// 🗑️ Eliminar un carrito
router.delete('/carrito/:idcarrito', (req, res) => {
    const { idcarrito } = req.params;

    connection.query('DELETE FROM carrito WHERE idcarrito=?', [idcarrito], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Carrito eliminado' });
    });
});

// 👥 Mostrar todos los carritos
router.get('/carrito', (req, res) => {
    connection.query('SELECT * FROM carrito', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 Mostrar un carrito por ID
router.get('/carrito/:idcarrito', (req, res) => {
    connection.query('SELECT * FROM carrito WHERE idcarrito=?', [req.params.idcarrito], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json(results[0]);
    });
});

// 🏷️ Filtrar por estatus (llevar/dejar)
router.get('/carrito/estatus/:estatus', (req, res) => {
    connection.query('SELECT * FROM carrito WHERE estatus=?', [req.params.estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports=router;
