const express = require('express');
const pool = require('../db'); // Usando `pool` para `async/await`
require('dotenv').config();
const router = express.Router();

// 📌 Crear un carrito
router.post('/', async (req, res) => {
    const { estatus } = req.body;

    if (!estatus || !['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    try {
        const query = 'INSERT INTO carrito (estatus) VALUES (?)';
        const [result] = await pool.query(query, [estatus]);

        res.status(201).json({ message: 'Carrito creado', idcarrito: result.insertId });
    } catch (err) {
        console.error('Error al registrar carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Editar un carrito
router.put('/:id', async (req, res) => {
    const { estatus } = req.body;
    const { id } = req.params;

    if (!id || !estatus || !['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'ID del carrito y estatus válido son requeridos' });
    }

    try {
        const query = 'UPDATE carrito SET estatus=? WHERE id=?';
        await pool.query(query, [estatus, id]);

        res.json({ message: 'Carrito actualizado' });
    } catch (err) {
        console.error('Error al actualizar carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar un carrito
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID del carrito es obligatorio' });
    }

    try {
        await pool.query('DELETE FROM carrito WHERE id=?', [id]);
        res.json({ message: 'Carrito eliminado' });
    } catch (err) {
        console.error('Error al eliminar carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👥 Mostrar todos los carritos
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM carrito');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener carritos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Mostrar un carrito por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID del carrito es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM carrito WHERE id=?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏷️ Filtrar por estatus (llevar/dejar)
router.get('/estatus/:estatus', async (req, res) => {
    const { estatus } = req.params;

    if (!estatus || !['llevar', 'dejar'].includes(estatus)) {
        return res.status(400).json({ error: 'El estatus debe ser "llevar" o "dejar"' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM carrito WHERE estatus=?', [estatus]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron carritos con ese estatus' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por estatus:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏁 Exportar el router
module.exports = router;
