import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateHimalayaImage() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'Kowsh@123',
            database: process.env.DB_NAME || 'ai_recommender'
        });

        await connection.query("UPDATE products SET image_url = '/assets/himalaya.png' WHERE name LIKE '%Himalaya%'");
        console.log('Himalaya image URL updated successfully in database.');
        
        await connection.end();
    } catch (error) {
        console.error('Error updating image URL:', error);
    }
}

updateHimalayaImage();
