const express = require('express');
const pool = require('../db'); // Usando `pool` para `async/await`
require('dotenv').config();
const router = express.Router();

// 📌 Agregar un producto al carrito
router.post('/:idcarrito/productos', async (req, res) => {
    const { idproducto, cantidad } = req.body;
    const { idcarrito } = req.params;

    if (!idcarrito || !idproducto || !cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'ID del carrito, producto y cantidad válida son obligatorios' });
    }

    try {
        const query = 'INSERT INTO carrito_productos (idcarrito, idproducto, cantidad) VALUES (?, ?, ?)';
        await pool.query(query, [idcarrito, idproducto, cantidad]);

        res.status(201).json({ message: 'Producto agregado al carrito', idcarrito, idproducto });
    } catch (err) {
        console.error('Error al agregar producto al carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Actualizar cantidad de un producto en el carrito
router.put('/:idcarrito/productos/:idproducto', async (req, res) => {
    const { cantidad } = req.body;
    const { idcarrito, idproducto } = req.params;

    if (!cantidad || cantidad <= 0) {
        return res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
    }

    try {
        const query = 'UPDATE carrito_productos SET cantidad=? WHERE idcarrito=? AND idproducto=?';
        await pool.query(query, [cantidad, idcarrito, idproducto]);

        res.json({ message: 'Cantidad actualizada en el carrito' });
    } catch (err) {
        console.error('Error al actualizar cantidad en el carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar un producto del carrito
router.delete('/:idcarrito/productos/:idproducto', async (req, res) => {
    const { idcarrito, idproducto } = req.params;

    if (!idcarrito || !idproducto) {
        return res.status(400).json({ error: 'ID del carrito y producto son obligatorios' });
    }

    try {
        await pool.query('DELETE FROM carrito_productos WHERE idcarrito=? AND idproducto=?', [idcarrito, idproducto]);
        res.json({ message: 'Producto eliminado del carrito' });
    } catch (err) {
        console.error('Error al eliminar producto del carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👥 Mostrar todos los productos de un carrito
router.get('/:idcarrito/productos', async (req, res) => {
    const { idcarrito } = req.params;

    if (!idcarrito) {
        return res.status(400).json({ error: 'ID del carrito es obligatorio' });
    }

    try {
        const query = `
            SELECT p.*, cp.cantidad 
            FROM carrito_productos cp 
            JOIN productos p ON cp.idproducto = p.id
            WHERE cp.idcarrito=?
        `;
        const [results] = await pool.query(query, [idcarrito]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos en este carrito' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error al obtener productos del carrito:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏁 Exportar el router
module.exports = router;
