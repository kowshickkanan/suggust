import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        // Forward to Python RAG Service
        const pythonRes = await fetch('http://localhost:8000/rag_chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!pythonRes.ok) throw new Error('Python RAG Service Failed');
        const data = await pythonRes.json();
        
        res.json({ response: data.response });
    } catch (err) {
        console.error('--- RAG Bridge Connection Error ---');
        console.error('Error Details:', err.message);
        console.error('Hint: Make sure the Python ML service is running on http://localhost:8000');
        
        res.status(503).json({ 
            error: "Service unavailable",
            response: "⚠️ **Connection Error:** The AI service is currently unavailable. Please ensure the ML backend is running."
        });
    }
});

export default router;
