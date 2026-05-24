import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function cleanupDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_recommender'
        });

        console.log('Connected to database. Starting cleanup...');

        // Delete products that are not from the core brands
        const [prodResult] = await connection.query(`
            DELETE FROM products 
            WHERE name NOT LIKE '%Derma Co%' 
              AND name NOT LIKE '%Himalaya%' 
              AND name NOT LIKE '%Mamaearth%'
        `);
        console.log(`Deleted ${prodResult.affectedRows} products.`);

        // Delete keywords that are not linked to these products
        // Note: product_keywords uses 'product_name' which is a partial name in some cases
        const [kwResult] = await connection.query(`
            DELETE FROM product_keywords 
            WHERE product_name NOT LIKE '%Derma Co%' 
              AND product_name NOT LIKE '%Himalaya%' 
              AND product_name NOT LIKE '%Mamaearth%'
        `);
        console.log(`Deleted ${kwResult.affectedRows} keywords.`);

        // Also clean up knowledge base to keep only relevant topics
        const [kbResult] = await connection.query(`
            DELETE FROM knowledge_base 
            WHERE topic NOT IN ('The Derma Co', 'Himalaya', 'Mamaearth')
              AND category != 'scientific' -- Keep general science, but remove specific brand science for others
        `);
        // Actually, let's just keep the skincare science
        await connection.query(`
             DELETE FROM knowledge_base 
             WHERE topic NOT IN ('The Derma Co', 'Himalaya', 'Mamaearth')
               AND topic NOT IN ('Acne', 'Skincare', 'Oily Skin', 'Dry Skin', 'Salicylic Acid', 'Niacinamide', 'Vitamin C')
        `);
        
        console.log('Database cleanup complete.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
}

cleanupDatabase();
