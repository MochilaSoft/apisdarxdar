const express = require('express');
const pool = require('../db'); // Usando mysql2 con promesas
require('dotenv').config();
const router = express.Router();

// 📌 Registrar un producto
router.post('/registrar', async (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, cantidad } = req.body;

    if (!nombreproducto || !imagen || !idcategoria) {
        return res.status(400).json({ error: 'El nombre, imagen y categoría son obligatorios' });
    }

    try {
        // Generar código único
        const codigo = `PROD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const estatus = 1; // Estatus predeterminado

        const query = `
            INSERT INTO productos (codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [results] = await pool.query(query, [codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad]);

        res.status(201).json({ message: 'Producto registrado con éxito', id: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Editar un producto
router.put('/:idproducto', async (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad } = req.body;
    const { idproducto } = req.params;

    try {
        const query = 'UPDATE productos SET nombreproducto=?, imagen=?, idcategoria=?, talla=?, color=?, tela=?, descripcion=?, estatus=?, cantidad=? WHERE idproducto=?';
        const [results] = await pool.query(query, [nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad, idproducto]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar un producto
router.delete('/:idproducto', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM productos WHERE idproducto=?', [req.params.idproducto]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Mostrar todos los productos
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.idcategoria
        `;
        const [results] = await pool.query(query);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Mostrar un producto por ID
router.get('/:idproducto', async (req, res) => {
    try {
        const query = `
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.idcategoria
            WHERE productos.idproducto = ?
        `;
        const [results] = await pool.query(query, [req.params.idproducto]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🏷️ Filtrar productos por categoría
router.get('/categoria/:idcategoria', async (req, res) => {
    try {
        const query = `
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.idcategoria
            WHERE productos.idcategoria = ?
        `;
        const [results] = await pool.query(query, [req.params.idcategoria]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Filtrar productos por estatus (Disponible/No disponible)
router.get('/estatus/:estatus', async (req, res) => {
    try {
        const query = `
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.idcategoria
            WHERE productos.estatus = ?
        `;
        const [results] = await pool.query(query, [req.params.estatus]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🔍 Buscar productos por nombre
router.get('/nombre/:nombreproducto', async (req, res) => {
    try {
        const query = `
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.idcategoria
            WHERE productos.nombreproducto LIKE ?
        `;
        const [results] = await pool.query(query, [`%${req.params.nombreproducto}%`]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Exportar router
module.exports = router;
