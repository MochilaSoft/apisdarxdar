const express = require('express');
const pool = require('../db'); // Usando `pool` para `async/await`
require('dotenv').config();
const router = express.Router();

// 📌 Registrar un producto
router.post('/', async (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, cantidad } = req.body;

    if (!nombreproducto || !idcategoria || !cantidad) {
        return res.status(400).json({ error: 'El nombre, la categoría y la cantidad son obligatorios' });
    }

    try {
        const codigo = `PROD-${Date.now()}`;
        const estatus = 1;

        const query = `
            INSERT INTO productos (codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [codigo, nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad]);

        res.status(201).json({ message: 'Producto registrado con éxito', id: result.insertId });
    } catch (err) {
        console.error('Error al registrar producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✏️ Editar un producto
router.put('/:id', async (req, res) => {
    const { nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad } = req.body;
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'El ID del producto es obligatorio' });
    }

    try {
        const query = `
            UPDATE productos SET nombreproducto=?, imagen=?, idcategoria=?, talla=?, color=?, tela=?, descripcion=?, estatus=?, cantidad=? 
            WHERE id=?
        `;
        await pool.query(query, [nombreproducto, imagen, idcategoria, talla, color, tela, descripcion, estatus, cantidad, id]);

        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🗑️ Eliminar un producto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'El ID del producto es obligatorio' });
    }

    try {
        await pool.query('DELETE FROM productos WHERE id=?', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 👥 Mostrar todos los productos
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.id
        `);

        res.json(results);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Mostrar un producto por ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: 'El ID del producto es obligatorio' });
    }

    try {
        const [results] = await pool.query(`
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.id
            WHERE productos.id=?
        `, [id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener producto:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏷️ Filtrar productos por categoría
router.get('/categoria/:idcategoria', async (req, res) => {
    const { idcategoria } = req.params;

    if (!idcategoria) {
        return res.status(400).json({ error: 'El ID de la categoría es obligatorio' });
    }

    try {
        const [results] = await pool.query(`
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.id
            WHERE productos.idcategoria=?
        `, [idcategoria]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos en esta categoría' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por categoría:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📌 Filtrar productos por estatus (Disponible/No disponible)
router.get('/estatus/:estatus', async (req, res) => {
    const { estatus } = req.params;

    if (!estatus) {
        return res.status(400).json({ error: 'El estatus es obligatorio' });
    }

    try {
        const [results] = await pool.query(`
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.id
            WHERE productos.estatus=?
        `, [estatus]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos con ese estatus' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por estatus:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔍 Buscar productos por nombre
router.get('/nombre/:nombreproducto', async (req, res) => {
    const { nombreproducto } = req.params;

    if (!nombreproducto) {
        return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    }

    try {
        const [results] = await pool.query(`
            SELECT productos.*, categorias.titulo AS categoria_titulo 
            FROM productos 
            JOIN categorias ON productos.idcategoria = categorias.id
            WHERE productos.nombreproducto LIKE ?
        `, [`%${nombreproducto}%`]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron productos con ese nombre' });
        }

        res.json(results);
    } catch (err) {
        console.error('Error en búsqueda por nombre:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🏁 Exportar el router
module.exports = router;
