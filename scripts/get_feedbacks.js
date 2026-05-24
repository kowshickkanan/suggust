import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function queryDB() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ai_recommender',
    });
    
    try {
        const [rows] = await db.query('SELECT * FROM feedbacks');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error("DB Query error:", err);
    } finally {
        await db.end();
    }
}

queryDB();
