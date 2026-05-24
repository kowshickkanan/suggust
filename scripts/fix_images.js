import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_recommender'
        });
        
        await conn.query(`UPDATE products SET image_url = 'https://images.unsplash.com/photo-1556228578-8c7c2f9a08e0?auto=format&fit=crop&w=500&q=60' WHERE image_url LIKE '/%'`);
        console.log("Images fixed successfully.");
        await conn.end();
    } catch(e) {
        console.error(e);
    }
}

run();
