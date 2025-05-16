const express = require('express');
const connection = require('../db'); // <-- Ruta corregida
require('dotenv').config();
const router = express.Router();

// 📌 Registrar una nueva categoría
router.post('/categorias', (req, res) => {
    const { titulo, imagen, descripcion, estatus = 1 } = req.body;

    if (!titulo || !imagen) {
        return res.status(400).json({ error: 'El título y la imagen son obligatorios' });
    }

    const query = 'INSERT INTO categorias (titulo, imagen, descripcion, estatus) VALUES (?, ?, ?, ?)';
    connection.query(query, [titulo, imagen, descripcion, estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Categoría creada con éxito', id: results.insertId });
    });
});

// ✏️ Editar una categoría
router.put('/categorias/:idcategoria', (req, res) => {
    const { titulo, imagen, descripcion, estatus } = req.body;
    const { idcategoria } = req.params;

    const query = 'UPDATE categorias SET titulo=?, imagen=?, descripcion=?, estatus=? WHERE idcategoria=?';
    connection.query(query, [titulo, imagen, descripcion, estatus, idcategoria], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Categoría actualizada' });
    });
});

// 🗑️ Eliminar una categoría
router.delete('/categorias/:idcategoria', (req, res) => {
    const { idcategoria } = req.params;

    connection.query('DELETE FROM categorias WHERE idcategoria=?', [idcategoria], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Categoría eliminada' });
    });
});

// 👥 Mostrar todas las categorías
router.get('/categorias', (req, res) => {
    connection.query('SELECT * FROM categorias', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🔍 Mostrar una categoría por ID
router.get('/categorias/:idcategoria', (req, res) => {
    connection.query('SELECT * FROM categorias WHERE idcategoria=?', [req.params.idcategoria], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json(results[0]);
    });
});

// 🏷️ Filtrar por estatus (Disponible/No disponible)
router.get('/categorias/estatus/:estatus', (req, res) => {
    connection.query('SELECT * FROM categorias WHERE estatus=?', [req.params.estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
module.exports=router;