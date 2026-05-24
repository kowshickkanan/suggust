import express from 'express';
import db from '../db.js';

const router = express.Router();

router.get('/getProducts', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products', details: err.message });
    }
});

export default router;
