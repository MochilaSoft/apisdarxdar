const express = require('express');
const connection = require('../db'); // <-- Ruta corregida
require('dotenv').config();
const router = express.Router();

// 📌 Registrar un producto
router.post('/registrar', (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, cantidad } = req.body;

    // Generar código automáticamente
    const codigo = `PROD-${Date.now()}`; // Ejemplo: PROD-1684972342342
    const estatus = 1; // Asignar estatus predeterminado

    const query = `
        INSERT INTO productos (codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    connection.query(
        query,
        [codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Producto registrado con éxito', id: results.insertId });
        }
    );
});

// ✏️ Editar un producto
router.put('/productos/:idproducto', (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad } = req.body;
    const { idproducto } = req.params;

    const query = 'UPDATE productos SET nombreproducto=?, idcategoria=?, talla=?, color=?, tela=?, descripcion=?, estatus=?, cantidad=? WHERE idproducto=?';
    connection.query(query, [nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad, idproducto], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto actualizado' });
    });
});

// 🗑️ Eliminar un producto
router.delete('/productos/:idproducto', (req, res) => {
    const { idproducto } = req.params;

    connection.query('DELETE FROM productos WHERE idproducto=?', [idproducto], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado' });
    });
});

// 👥 Mostrar todos los productos
router.get('/productos', (req, res) => {
    const query = `
        SELECT productos.*, categorias.titulo AS categoria_titulo 
        FROM productos 
        JOIN categorias ON productos.idcategoria = categorias.idcategoria
    `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// 🔍 Mostrar un producto por ID
router.get('/get/:idproducto', (req, res) => {
    const query = `
        SELECT productos.*, categorias.titulo AS categoria_titulo 
        FROM productos 
        JOIN categorias ON productos.idcategoria = categorias.idcategoria
        WHERE productos.idproducto = ?
    `;
    connection.query(query, [req.params.idproducto], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(results[0]);
    });
});


// 🏷️ Filtrar productos por categoría
router.get('categoria/:idcategoria', (req, res) => {
    const query = `
        SELECT productos.*, categorias.titulo AS categoria_titulo 
        FROM productos 
        JOIN categorias ON productos.idcategoria = categorias.idcategoria
        WHERE productos.idcategoria = ?
    `;
    connection.query(query, [req.params.idcategoria], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// 📌 Filtrar productos por estatus (Disponible/No disponible)
router.get('/estatus/:estatus', (req, res) => {
    const query = `
        SELECT productos.*, categorias.titulo AS categoria_titulo 
        FROM productos 
        JOIN categorias ON productos.idcategoria = categorias.idcategoria
        WHERE productos.estatus = ?
    `;

    connection.query(query, [req.params.estatus], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// 🔍 Buscar productos por nombre
router.get('/nombre/:nombreproducto', (req, res) => {
    const query = `
        SELECT productos.*, categorias.titulo AS categoria_titulo 
        FROM productos 
        JOIN categorias ON productos.idcategoria = categorias.idcategoria
        WHERE productos.nombreproducto LIKE ?
    `;

    connection.query(query, [`%${req.params.nombreproducto}%`], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
module.exports = router;
