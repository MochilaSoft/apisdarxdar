const express = require('express');
const pool = require('../db'); // Usando mysql2 con promesas
require('dotenv').config();
const router = express.Router();

// 📌 Agregar un producto al carrito
router.post('/:idcarrito/productos', async (req, res) => {
    const { idproducto, cantidad } = req.body;
    const { idcarrito } = req.params;

    if (!idproducto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'El producto y una cantidad válida son obligatorios' });
    }

    try {
        const query = 'INSERT INTO carrito_productos (idcarrito, idproducto, cantidad) VALUES (?, ?, ?)';
        await pool.query(query, [idcarrito, idproducto, cantidad]);
        res.status(201).json({ message: 'Producto agregado al carrito', idcarrito, idproducto });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Actualizar cantidad de un producto en el carrito
router.put('/:idcarrito/productos/:idproducto', async (req, res) => {
    const { cantidad } = req.body;
    const { idcarrito, idproducto } = req.params;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'Cantidad debe ser mayor a 0' });
    }

    try {
        const query = 'UPDATE carrito_productos SET cantidad=? WHERE idcarrito=? AND idproducto=?';
        const [results] = await pool.query(query, [cantidad, idcarrito, idproducto]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        res.json({ message: 'Cantidad actualizada en el carrito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 🗑️ Eliminar un producto del carrito
router.delete('/:idcarrito/productos/:idproducto', async (req, res) => {
    try {
        const query = 'DELETE FROM carrito_productos WHERE idcarrito=? AND idproducto=?';
        const [result] = await pool.query(query, [req.params.idcarrito, req.params.idproducto]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        res.json({ message: 'Producto eliminado del carrito' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👥 Mostrar todos los productos de un carrito
router.get('/:idcarrito/productos', async (req, res) => {
    try {
        const query = `
            SELECT p.*, cp.cantidad 
            FROM carrito_productos cp 
            JOIN productos p ON cp.idproducto = p.idproducto 
            WHERE cp.idcarrito=?
        `;
        const [results] = await pool.query(query, [req.params.idcarrito]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 👉 Exportar router
module.exports = router;
