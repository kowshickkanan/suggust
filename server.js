import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import recommendRoutes from './routes/recommend.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();

// Your frontend URL
const FRONTEND_URL = 'https://your-frontend.vercel.app';

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

const tempFeedbacks = [];

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/ai/recommend', recommendRoutes);
app.use('/api/ai/chat', chatRoutes);

// Feedback Submission API
app.post('/api/feedback/submit', async (req, res) => {
    const {
        product_name,
        rating,
        review_text,
        emoji,
        source,
        mentioned_ingredients,
        user_id
    } = req.body;

    try {
        const text = review_text.toLowerCase();
        const userRating = parseInt(rating, 10);

        // Sentiment Analysis
        const posWords = [
            'good', 'great', 'love', 'best',
            'effective', 'amazing', 'happy',
            'glow', 'clear', 'worked', 'result'
        ];

        const negWords = [
            'bad', 'worst', 'waste',
            'breakout', 'pimple', 'scam',
            'hate', 'oily', 'dry',
            'irritation', 'expensive'
        ];

        let sentiment = 'neutral';

        const posCount = posWords.filter(word =>
            text.includes(word)
        ).length;

        const negCount = negWords.filter(word =>
            text.includes(word)
        ).length;

        if (posCount > negCount) sentiment = 'positive';
        else if (negCount > posCount) sentiment = 'negative';

        // Consistency Check
        let consistencyFlag = false;

        if (userRating >= 4 && sentiment === 'negative')
            consistencyFlag = true;

        if (userRating <= 2 && sentiment === 'positive')
            consistencyFlag = true;

        const posEmojis = ['😊', '😍', '👍', '✨', '💖'];
        const negEmojis = ['😡', '👎', '😠', '😣', '💀'];

        if (
            sentiment === 'positive' &&
            negEmojis.includes(emoji)
        ) {
            consistencyFlag = true;
        }

        if (
            sentiment === 'negative' &&
            posEmojis.includes(emoji)
        ) {
            consistencyFlag = true;
        }

        // Scientific Verification
        const [validTerms] = await db.query(
            'SELECT term FROM product_scientific_verifiers WHERE product_name = ?',
            [product_name]
        );

        let scientificScore = 0;

        const checkArea =
            (mentioned_ingredients || '') + ' ' + text;

        if (validTerms.length > 0) {
            const matches = validTerms.filter(v =>
                checkArea.includes(v.term.toLowerCase())
            ).length;

            if (matches >= 3) scientificScore = 80;
            else if (matches >= 1) scientificScore = 40;
        }

        // Source Score
        let sourceScore = 0;

        if (source === 'dermatologist')
            sourceScore = 30;

        else if (source === 'self')
            sourceScore = 20;

        else if (source === 'friend')
            sourceScore = 10;

        // Penalty
        let penalty = 0;

        if (consistencyFlag)
            penalty = 50;

        if (text.length < 10)
            penalty += 20;

        // Final Score
        const finalScore = Math.max(
            0,
            sourceScore + scientificScore - penalty + 20
        );

        let verdict = 'Fake';

        if (!consistencyFlag) {
            if (finalScore >= 60)
                verdict = 'Genuine';

            else if (finalScore >= 30)
                verdict = 'Suspicious';

            if (
                source === 'dermatologist' &&
                scientificScore === 0
            ) {
                verdict = 'Suspicious';
            }
        }

        // Insert into DB
        const isPublic = verdict !== 'Fake';

        await db.query(
            `INSERT INTO feedbacks
            (
                product_name,
                rating,
                review_text,
                emoji,
                source,
                mentioned_ingredients,
                trust_score,
                verdict,
                is_public,
                user_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                product_name,
                userRating,
                review_text,
                emoji,
                source,
                mentioned_ingredients,
                finalScore,
                verdict,
                isPublic,
                user_id
            ]
        );

        res.json({
            success: true,
            verdict,
            message:
                'Feedback submitted successfully for verification.'
        });

    } catch (error) {
        console.error('Feedback Error:', error);

        res.status(500).json({
            error: 'Feedback submission failed'
        });
    }
});

// Get Public Feedbacks
app.get('/api/feedbacks', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM feedbacks WHERE verdict != 'Fake' ORDER BY created_at DESC"
        );

        const allFeedbacks = [
            ...tempFeedbacks,
            ...rows
        ].sort(
            (a, b) =>
                new Date(b.created_at) -
                new Date(a.created_at)
        );

        res.json(allFeedbacks);

    } catch (error) {
        console.warn(
            'DB offline, showing temp feedbacks only.'
        );

        res.json(
            tempFeedbacks.sort(
                (a, b) => b.created_at - a.created_at
            )
        );
    }
});

// User Feedbacks
app.get('/api/feedbacks/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM feedbacks WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.userId]
        );

        res.json(rows);

    } catch (error) {
        console.error(
            'Error fetching user feedbacks:',
            error
        );

        res.status(500).json({
            error: 'Failed to fetch user feedbacks'
        });
    }
});

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT 1 + 1 AS result'
        );

        res.json({
            status: 'ok',
            db_connected: rows[0].result === 2
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Export app for Vercel
export default app;
