import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initFeedbackDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_recommender',
            multipleStatements: true
        });

        const sqlPath = path.join(__dirname, '../../database/feedback_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Initializing feedbacks table...');
        await connection.query(sql);

        console.log('Feedback DB initialized!');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Feedback DB init failed:', error);
        process.exit(1);
    }
}

initFeedbackDB();
