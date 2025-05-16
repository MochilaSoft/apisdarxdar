const express = require('express');
const pool = require('../db'); // Usando mysql2 con promesas
require('dotenv').config();
const router = express.Router();

// 📌 Crear un carrito
router.post('/', async (req, res) => {
    const { estatus } = req.body;

    if (!['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    try {
        const query = 'INSERT INTO carrito (estatus) VALUES (?)';
        const [results] = await pool.query(query, [estatus]);
        res.status(201).json({ message: 'Carrito creado', idcarrito: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Editar un carrito
router.put('/:idcarrito', async (req, res) => {
    const { estatus } = req.body;
    const { idcarrito } = req.params;

    if (!['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    try {
        const query = 'UPDATE carrito SET estatus=? WHERE idcarrito=?';
        const [results] = await pool.query(query, [estatus, idcarrito]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json({ message: 'Carrito actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar un carrito
router.delete('/:idcarrito', async (req, res) => {
    try {
        const query = 'DELETE FROM carrito WHERE idcarrito=?';
        const [result] = await pool.query(query, [req.params.idcarrito]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json({ message: 'Carrito eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Mostrar todos los carritos
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM carrito');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Mostrar un carrito por ID
router.get('/:idcarrito', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM carrito WHERE idcarrito=?', [req.params.idcarrito]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🏷️ Filtrar por estatus (llevar/dejar)
router.get('/estatus/:estatus', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM carrito WHERE estatus=?', [req.params.estatus]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Exportar router
module.exports = router;
