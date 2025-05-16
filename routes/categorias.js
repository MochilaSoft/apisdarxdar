const express = require('express');
const pool = require('../db'); // Usando mysql2 con promesas
require('dotenv').config();
const router = express.Router();

// 📌 Registrar una nueva categoría
router.post('/', async (req, res) => {
    const { titulo, imagen, descripcion, estatus = 1 } = req.body;

    if (!titulo || !imagen) {
        return res.status(400).json({ error: 'El título y la imagen son obligatorios' });
    }

    try {
        const query = 'INSERT INTO categorias (titulo, imagen, descripcion, estatus) VALUES (?, ?, ?, ?)';
        const [results] = await pool.query(query, [titulo, imagen, descripcion, estatus]);

        res.status(201).json({ message: 'Categoría creada con éxito', id: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Editar una categoría
router.put('/:idcategoria', async (req, res) => {
    const { titulo, imagen, descripcion, estatus } = req.body;
    const { idcategoria } = req.params;

    try {
        const query = 'UPDATE categorias SET titulo=?, imagen=?, descripcion=?, estatus=? WHERE idcategoria=?';
        const [results] = await pool.query(query, [titulo, imagen, descripcion, estatus, idcategoria]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar una categoría
router.delete('/:idcategoria', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM categorias WHERE idcategoria=?', [req.params.idcategoria]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json({ message: 'Categoría eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Mostrar todas las categorías
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categorias');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Mostrar una categoría por ID
router.get('/:idcategoria', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categorias WHERE idcategoria=?', [req.params.idcategoria]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🏷️ Filtrar por estatus (Disponible/No disponible)
router.get('/estatus/:estatus', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categorias WHERE estatus=?', [req.params.estatus]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Exportar router
module.exports = router;
