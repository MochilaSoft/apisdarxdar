const express = require('express');
const connection = require('../db'); // <-- Ruta corregida
require('dotenv').config();
const router = express.Router();

// 📌 Agregar un producto al carrito
router.post('/carrito/:idcarrito/productos', (req, res) => {
    const { idproducto, cantidad } = req.body;
    const { idcarrito } = req.params;

    if (!idproducto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'El producto y una cantidad válida son obligatorios' });
    }

    const query = 'INSERT INTO carrito_productos (idcarrito, idproducto, cantidad) VALUES (?, ?, ?)';
    connection.query(query, [idcarrito, idproducto, cantidad], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Producto agregado al carrito', idcarrito, idproducto });
    });
});

// ✏️ Actualizar cantidad de un producto en el carrito
router.put('/carrito/:idcarrito/productos/:idproducto', (req, res) => {
    const { cantidad } = req.body;
    const { idcarrito, idproducto } = req.params;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Cantidad debe ser mayor a 0' });
    }

    const query = 'UPDATE carrito_productos SET cantidad=? WHERE idcarrito=? AND idproducto=?';
    connection.query(query, [cantidad, idcarrito, idproducto], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cantidad actualizada en el carrito' });
    });
});

// 🗑️ Eliminar un producto del carrito
router.delete('/carrito/:idcarrito/productos/:idproducto', (req, res) => {
    const { idcarrito, idproducto } = req.params;

    connection.query('DELETE FROM carrito_productos WHERE idcarrito=? AND idproducto=?', [idcarrito, idproducto], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado del carrito' });
    });
});

// 👥 Mostrar todos los productos de un carrito
router.get('/carrito/:idcarrito/productos', (req, res) => {
    connection.query('SELECT p.*, cp.cantidad FROM carrito_productos cp JOIN productos p ON cp.idproducto = p.idproducto WHERE cp.idcarrito=?', [req.params.idcarrito], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

module.exports=router;
