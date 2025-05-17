const express = require('express');
const pool = require('../db'); // Usando `pool` para `async/await`
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
        const [result] = await pool.query(query, [titulo, imagen, descripcion, estatus]);

        res.status(201).json({ message: 'Categoría creada con éxito', id: result.insertId });
    } catch (err) {
        console.error('Error al registrar categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Editar una categoría
router.put('/:id', async (req, res) => {
    const { titulo, imagen, descripcion, estatus } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de la categoría es obligatorio' });
    }

    try {
        const query = 'UPDATE categorias SET titulo=?, imagen=?, descripcion=?, estatus=? WHERE id=?';
        await pool.query(query, [titulo, imagen, descripcion, estatus, id]);

        res.json({ message: 'Categoría actualizada' });
    } catch (err) {
        console.error('Error al actualizar categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar una categoría
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de la categoría es obligatorio' });
    }

    try {
        await pool.query('DELETE FROM categorias WHERE id=?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (err) {
        console.error('Error al eliminar categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👥 Mostrar todas las categorías
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM categorias');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Mostrar una categoría por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'ID de la categoría es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM categorias WHERE id=?', [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏷️ Filtrar por estatus (Disponible/No disponible)
router.get('/estatus/:estatus', async (req, res) => {
    const { estatus } = req.params;

    if (!estatus) {
        return res.status(400).json({ error: 'El estatus es obligatorio' });
    }

    try {
        const [results] = await pool.query('SELECT * FROM categorias WHERE estatus=?', [estatus]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron categorías con ese estatus' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por estatus:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏁 Exportar el router
module.exports = router;
