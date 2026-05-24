import express from 'express';
import { processRecommendation } from '../services/aiService.js';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const recommendations = await processRecommendation(prompt);
        res.json(recommendations);
    } catch (err) {
        res.status(500).json({ error: 'AI Recommendation failed', details: err.message });
    }
});

router.post('/clinical', async (req, res) => {
    try {
        const { skinType, concerns, targetActives } = req.body;
        
        const pythonRes = await fetch('http://localhost:8000/clinical_recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skinType, concerns, targetActives })
        });
        
        if (!pythonRes.ok) throw new Error('Python ML Service Clinical Recommendation failed');
        const data = await pythonRes.json();
        
        res.json(data);
    } catch (err) {
        console.error('Error calling Python ML clinical recommend:', err);
        res.status(500).json({ error: 'Clinical Recommendation failed', details: err.message });
    }
});

export default router;
